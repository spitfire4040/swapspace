import { isNative } from './platform';

const AUTH_KEYS = ['accessToken', 'refreshToken', 'user'] as const;

// In-memory token cache for synchronous access (needed by Axios interceptor)
const tokenCache: Record<string, string | null> = {
  accessToken: null,
  refreshToken: null,
};

export async function storageGet(key: string): Promise<string | null> {
  if (isNative()) {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key });
    return value;
  }
  return localStorage.getItem(key);
}

export async function storageSet(key: string, value: string): Promise<void> {
  if (key === 'accessToken' || key === 'refreshToken') {
    tokenCache[key] = value;
  }
  if (isNative()) {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key, value });
    return;
  }
  localStorage.setItem(key, value);
}

export async function storageRemove(key: string): Promise<void> {
  if (key === 'accessToken' || key === 'refreshToken') {
    tokenCache[key] = null;
  }
  if (isNative()) {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.remove({ key });
    return;
  }
  localStorage.removeItem(key);
}

/** Remove only auth-related keys (not all of localStorage) */
export async function storageClearAuth(): Promise<void> {
  for (const key of AUTH_KEYS) {
    await storageRemove(key);
  }
}

/** Sync read for Axios interceptor — returns cached token */
export function getTokenSync(): string | null {
  return tokenCache.accessToken;
}

/** Sync read for Axios interceptor — returns cached refresh token */
export function getRefreshTokenSync(): string | null {
  return tokenCache.refreshToken;
}

/** Load tokens from persistent storage into memory cache. Call once at startup. */
export async function initTokenCache(): Promise<void> {
  tokenCache.accessToken = await storageGet('accessToken');
  tokenCache.refreshToken = await storageGet('refreshToken');
}
