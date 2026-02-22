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
  username: string;
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

export async function getMyPhotos(): Promise<{ photos: Photo[] }> {
  const res = await apiClient.get('/photos/mine');
  return res.data;
}

export async function uploadPhoto(
  file: File,
  caption?: string,
  onProgress?: (percent: number) => void
): Promise<Photo> {
  const form = new FormData();
  form.append('photo', file);
  if (caption) form.append('caption', caption);

  const res = await apiClient.post<Photo>('/photos', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data;
}

export async function deletePhoto(photoId: string): Promise<void> {
  await apiClient.delete(`/photos/${photoId}`);
}
