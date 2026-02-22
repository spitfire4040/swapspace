import apiClient from './client';

export async function recordSwipe(photoId: string, direction: 'like' | 'skip'): Promise<void> {
  await apiClient.post('/swipes', { photoId, direction });
}
