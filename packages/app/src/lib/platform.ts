import { Capacitor } from '@capacitor/core';

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function getApiBaseUrl(): string {
  if (isNative()) {
    const url = import.meta.env.VITE_API_URL;
    if (!url) throw new Error('VITE_API_URL must be set in .env.capacitor for native builds');
    return url;
  }
  return '/api/v1';
}

export function getServerUrl(): string {
  if (isNative()) {
    const url = import.meta.env.VITE_SERVER_URL;
    if (!url) throw new Error('VITE_SERVER_URL must be set in .env.capacitor for native builds');
    return url;
  }
  return '';
}
