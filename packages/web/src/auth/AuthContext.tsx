import React, { createContext, useState, useEffect, useCallback } from 'react';
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

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const storeTokens = (response: authApi.AuthResponse) => {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    storeTokens(response);
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const response = await authApi.register({ email, username, password });
    storeTokens(response);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => {});
    }
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
