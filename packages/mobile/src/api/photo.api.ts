import apiClient from './client';

export interface Photo {
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

export async function getUnseenPhotos(
  limit = 10,
  cursor?: string
): Promise<{ photos: Photo[]; nextCursor: string | null }> {
  const params: Record<string, string | number> = { limit };
  if (cursor) params.cursor = cursor;
  const res = await apiClient.get('/photos/unseen', { params });
  return res.data;
}

export async function getLikedPhotos(): Promise<{ photos: Photo[] }> {
  const res = await apiClient.get('/photos/liked');
  return res.data;
}

export async function uploadPhoto(
  uri: string,
  filename: string,
  type: string,
  caption?: string
): Promise<Photo> {
  const form = new FormData();
  form.append('photo', { uri, name: filename, type } as unknown as Blob);
  if (caption) form.append('caption', caption);

  const res = await apiClient.post<Photo>('/photos', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
