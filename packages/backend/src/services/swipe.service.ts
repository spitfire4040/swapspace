import pool from '../config/db';
import { createError } from '../middleware/errorHandler';

export interface SwipeRecord {
  id: string;
  user_id: string;
  photo_id: string;
  direction: 'like' | 'skip';
  created_at: string;
}

export async function recordSwipe(
  userId: string,
  photoId: string,
  direction: 'like' | 'skip'
): Promise<SwipeRecord> {
  // Verify photo exists
  const photoCheck = await pool.query('SELECT id FROM photos WHERE id = $1', [photoId]);
  if (!photoCheck.rows[0]) throw createError(404, 'Photo not found');

  try {
    const result = await pool.query<SwipeRecord>(
      'INSERT INTO swipes (user_id, photo_id, direction) VALUES ($1, $2, $3) RETURNING *',
      [userId, photoId, direction]
    );
    return result.rows[0];
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      'code' in err &&
      (err as NodeJS.ErrnoException).code === '23505'
    ) {
      throw createError(409, 'Already swiped on this photo');
    }
    throw err;
  }
}

export async function getLikedSwipes(userId: string): Promise<SwipeRecord[]> {
  const result = await pool.query<SwipeRecord>(
    "SELECT * FROM swipes WHERE user_id = $1 AND direction = 'like' ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
}
