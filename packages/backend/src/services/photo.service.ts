import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db';
import { createError } from '../middleware/errorHandler';

export interface PhotoRecord {
  id: string;
  user_id: string;
  filename: string;
  thumbnail: string;
  caption: string | null;
  created_at: string;
  url: string;
  thumbnailUrl: string;
  username?: string;
}

function buildUrls(filename: string, thumbnail: string): { url: string; thumbnailUrl: string } {
  return {
    url: `/uploads/originals/${filename}`,
    thumbnailUrl: `/uploads/thumbnails/${thumbnail}`,
  };
}

export async function createPhoto(
  userId: string,
  originalFile: Express.Multer.File,
  caption?: string
): Promise<PhotoRecord> {
  const thumbName = `${uuidv4()}_thumb.jpg`;
  const thumbPath = path.join(process.cwd(), 'uploads', 'thumbnails', thumbName);

  await sharp(originalFile.path)
    .resize(400, 400, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);

  const result = await pool.query<PhotoRecord>(
    'INSERT INTO photos (user_id, filename, thumbnail, caption) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, originalFile.filename, thumbName, caption ?? null]
  );

  const photo = result.rows[0];
  return { ...photo, ...buildUrls(photo.filename, photo.thumbnail) };
}

export async function getUnseenPhotos(
  userId: string,
  limit: number,
  cursor?: string
): Promise<PhotoRecord[]> {
  let query: string;
  let params: (string | number)[];

  if (cursor) {
    query = `
      SELECT p.*, u.username
      FROM photos p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN swipes s ON s.photo_id = p.id AND s.user_id = $1
      WHERE s.id IS NULL
        AND p.user_id != $1
        AND p.created_at < (SELECT created_at FROM photos WHERE id = $3)
      ORDER BY p.created_at DESC
      LIMIT $2
    `;
    params = [userId, limit, cursor];
  } else {
    query = `
      SELECT p.*, u.username
      FROM photos p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN swipes s ON s.photo_id = p.id AND s.user_id = $1
      WHERE s.id IS NULL
        AND p.user_id != $1
      ORDER BY p.created_at DESC
      LIMIT $2
    `;
    params = [userId, limit];
  }

  const result = await pool.query<PhotoRecord>(query, params);
  return result.rows.map((p) => ({ ...p, ...buildUrls(p.filename, p.thumbnail) }));
}

export async function getLikedPhotos(userId: string): Promise<PhotoRecord[]> {
  const result = await pool.query<PhotoRecord>(
    `SELECT p.*, u.username
     FROM photos p
     JOIN users u ON u.id = p.user_id
     INNER JOIN swipes s ON s.photo_id = p.id
     WHERE s.user_id = $1 AND s.direction = 'like'
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return result.rows.map((p) => ({ ...p, ...buildUrls(p.filename, p.thumbnail) }));
}

export async function getMyPhotos(userId: string): Promise<PhotoRecord[]> {
  const result = await pool.query<PhotoRecord>(
    'SELECT * FROM photos WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows.map((p) => ({ ...p, ...buildUrls(p.filename, p.thumbnail) }));
}

export async function deletePhoto(photoId: string, userId: string): Promise<void> {
  const result = await pool.query<PhotoRecord>(
    'SELECT * FROM photos WHERE id = $1',
    [photoId]
  );
  const photo = result.rows[0];
  if (!photo) throw createError(404, 'Photo not found');
  if (photo.user_id !== userId) throw createError(403, 'Forbidden');

  await pool.query('DELETE FROM photos WHERE id = $1', [photoId]);

  // Clean up disk files
  const originalPath = path.join(process.cwd(), 'uploads', 'originals', photo.filename);
  const thumbPath = path.join(process.cwd(), 'uploads', 'thumbnails', photo.thumbnail);

  await fs.unlink(originalPath).catch(() => {});
  await fs.unlink(thumbPath).catch(() => {});
}
