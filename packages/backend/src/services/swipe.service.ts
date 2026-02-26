import { supabaseAdmin } from '../config/supabase';
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
  const { data: photo, error: photoError } = await supabaseAdmin
    .from('photos')
    .select('id')
    .eq('id', photoId)
    .single();

  if (photoError) {
    if (photoError.code === 'PGRST116') {
      throw createError(404, 'Photo not found');
    }
    console.error('Failed to verify photo:', photoError.message);
    throw createError(500, 'Failed to record swipe');
  }

  if (!photo) throw createError(404, 'Photo not found');

  const { data, error } = await supabaseAdmin
    .from('swipes')
    .insert({ user_id: userId, photo_id: photoId, direction })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw createError(409, 'Already swiped on this photo');
    }
    console.error('Failed to record swipe:', error.message);
    throw createError(500, 'Failed to record swipe');
  }

  return data as SwipeRecord;
}

export async function getLikedSwipes(userId: string): Promise<SwipeRecord[]> {
  const { data, error } = await supabaseAdmin
    .from('swipes')
    .select('*')
    .eq('user_id', userId)
    .eq('direction', 'like')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch swipes:', error.message);
    throw createError(500, 'Failed to fetch swipes');
  }

  return (data ?? []) as SwipeRecord[];
}
