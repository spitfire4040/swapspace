import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth.api';
import {
  storageGet,
  storageSet,
  storageClearAuth,
  initTokenCache,
} from '../lib/storage';

interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from storage and validate via refresh
  useEffect(() => {
    (async () => {
      try {
        await initTokenCache();
        const stored = await storageGet('user');
        if (!stored) return;

        const parsedUser = JSON.parse(stored) as User;
        setUser(parsedUser);

        // Validate session by refreshing tokens
        const refreshToken = await storageGet('refreshToken');
        if (refreshToken) {
          try {
            const response = await authApi.refresh(refreshToken);
            await storageSet('accessToken', response.accessToken);
            await storageSet('refreshToken', response.refreshToken);
            await storageSet('user', JSON.stringify(response.user));
            setUser(response.user);
          } catch {
            // Refresh failed — clear auth state
            await storageClearAuth();
            setUser(null);
          }
        }
      } catch {
        await storageClearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const storeTokens = useCallback(async (response: authApi.AuthResponse) => {
    await storageSet('accessToken', response.accessToken);
    await storageSet('refreshToken', response.refreshToken);
    await storageSet('user', JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    await storeTokens(response);
  }, [storeTokens]);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const response = await authApi.register({ email, username, password });
    await storeTokens(response);
  }, [storeTokens]);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    await storageClearAuth();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
