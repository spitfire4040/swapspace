import apiClient from './client';

export interface AuthResponse {
  user: { id: string; email: string; username: string; created_at: string };
  accessToken: string;
  refreshToken: string;
}

export async function register(data: {
  email: string;
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/register', data);
  return res.data;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/login', data);
  return res.data;
}

export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
  return res.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}
