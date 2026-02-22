import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as authApi from '../api/auth.api';

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

  useEffect(() => {
    SecureStore.getItemAsync('user').then((stored) => {
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          SecureStore.deleteItemAsync('user');
        }
      }
      setIsLoading(false);
    });
  }, []);

  const storeTokens = async (response: authApi.AuthResponse) => {
    await SecureStore.setItemAsync('accessToken', response.accessToken);
    await SecureStore.setItemAsync('refreshToken', response.refreshToken);
    await SecureStore.setItemAsync('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    await storeTokens(response);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const response = await authApi.register({ email, username, password });
    await storeTokens(response);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => {});
    }
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
