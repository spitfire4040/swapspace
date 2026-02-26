import crypto from 'crypto';
import sharp from 'sharp';
import { supabaseAdmin } from '../config/supabase';
import { createError } from '../middleware/errorHandler';

export interface PhotoRecord {
  id: string;
  user_id: string;
  original_path: string;
  thumbnail_path: string;
  caption: string | null;
  created_at: string;
  url: string;
  thumbnailUrl: string;
  username?: string;
}

function buildUrls(originalPath: string, thumbnailPath: string): { url: string; thumbnailUrl: string } {
  const { data: originalUrl } = supabaseAdmin.storage.from('photos').getPublicUrl(originalPath);
  const { data: thumbUrl } = supabaseAdmin.storage.from('photos').getPublicUrl(thumbnailPath);
  return {
    url: originalUrl.publicUrl,
    thumbnailUrl: thumbUrl.publicUrl,
  };
}

function getExtension(mimetype: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return map[mimetype] ?? '.jpg';
}

export async function createPhoto(
  userId: string,
  file: Express.Multer.File,
  caption?: string
): Promise<PhotoRecord> {
  const uuid = crypto.randomUUID();
  const ext = getExtension(file.mimetype);
  const originalPath = `originals/${uuid}${ext}`;
  const thumbPath = `thumbnails/${uuid}_thumb.jpg`;

  // Generate thumbnail from buffer
  const thumbBuffer = await sharp(file.buffer)
    .resize(400, 400, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Upload original to Supabase Storage
  const { error: origError } = await supabaseAdmin.storage
    .from('photos')
    .upload(originalPath, file.buffer, { contentType: file.mimetype });

  if (origError) {
    console.error('Failed to upload original:', origError.message);
    throw createError(500, 'Failed to upload photo');
  }

  // Upload thumbnail to Supabase Storage
  const { error: thumbError } = await supabaseAdmin.storage
    .from('photos')
    .upload(thumbPath, thumbBuffer, { contentType: 'image/jpeg' });

  if (thumbError) {
    // Clean up the original if thumbnail upload fails
    await supabaseAdmin.storage.from('photos').remove([originalPath]);
    console.error('Failed to upload thumbnail:', thumbError.message);
    throw createError(500, 'Failed to upload photo');
  }

  // Insert DB record
  const { data, error: dbError } = await supabaseAdmin
    .from('photos')
    .insert({
      user_id: userId,
      original_path: originalPath,
      thumbnail_path: thumbPath,
      caption: caption ?? null,
    })
    .select()
    .single();

  if (dbError || !data) {
    // Clean up storage on DB failure
    await supabaseAdmin.storage.from('photos').remove([originalPath, thumbPath]);
    console.error('Failed to create photo record:', dbError?.message);
    throw createError(500, 'Failed to create photo record');
  }

  return { ...data, ...buildUrls(data.original_path, data.thumbnail_path) };
}

export async function getUnseenPhotos(
  userId: string,
  limit: number,
  cursor?: string
): Promise<PhotoRecord[]> {
  const { data, error } = await supabaseAdmin.rpc('get_unseen_photos', {
    p_user_id: userId,
    p_limit: limit,
    p_cursor: cursor ?? null,
  });

  if (error) {
    console.error('Failed to fetch unseen photos:', error.message);
    throw createError(500, 'Failed to fetch photos');
  }

  return (data ?? []).map((row: Record<string, string>) => ({
    ...row,
    ...buildUrls(row.original_path, row.thumbnail_path),
  }));
}

export async function getLikedPhotos(userId: string): Promise<PhotoRecord[]> {
  const { data, error } = await supabaseAdmin.rpc('get_liked_photos', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Failed to fetch liked photos:', error.message);
    throw createError(500, 'Failed to fetch photos');
  }

  return (data ?? []).map((row: Record<string, string>) => ({
    ...row,
    ...buildUrls(row.original_path, row.thumbnail_path),
  }));
}

export async function getMyPhotos(userId: string): Promise<PhotoRecord[]> {
  const { data, error } = await supabaseAdmin
    .from('photos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch photos:', error.message);
    throw createError(500, 'Failed to fetch photos');
  }

  return (data ?? []).map((row) => ({
    ...row,
    ...buildUrls(row.original_path, row.thumbnail_path),
  }));
}

export async function deletePhoto(photoId: string, userId: string): Promise<void> {
  const { data: photo, error: fetchError } = await supabaseAdmin
    .from('photos')
    .select('*')
    .eq('id', photoId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      throw createError(404, 'Photo not found');
    }
    console.error('Failed to fetch photo:', fetchError.message);
    throw createError(500, 'Failed to delete photo');
  }

  if (!photo) throw createError(404, 'Photo not found');
  if (photo.user_id !== userId) throw createError(403, 'Forbidden');

  // Delete storage FIRST, then DB record
  const { error: storageError } = await supabaseAdmin.storage
    .from('photos')
    .remove([photo.original_path, photo.thumbnail_path]);

  if (storageError) {
    console.error('Failed to delete photo from storage:', storageError.message);
    throw createError(500, 'Failed to delete photo');
  }

  const { error: deleteError } = await supabaseAdmin
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (deleteError) {
    // Storage already deleted but DB deletion failed — log inconsistency
    console.error('Storage deleted but DB deletion failed:', deleteError.message);
    throw createError(500, 'Failed to delete photo');
  }
}
