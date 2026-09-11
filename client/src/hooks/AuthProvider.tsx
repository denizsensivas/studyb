import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { authAPI } from '../services/api';
import { AuthContext } from './AuthContext';
import type { RegisterInput, User, UserPreferences } from './authTypes';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('studyb_token'));
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('studyb_token')));

  useEffect(() => {
    if (!token) return;

    let active = true;
    authAPI
      .getProfile()
      .then((res) => {
        if (active) setUser(res.data);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem('studyb_token');
        localStorage.removeItem('studyb_user');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem('studyb_token', newToken);
    localStorage.setItem('studyb_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const testLogin = useCallback(async () => {
    const res = await authAPI.testLogin();
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem('studyb_token', newToken);
    localStorage.setItem('studyb_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    const res = await authAPI.register(data);
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem('studyb_token', newToken);
    localStorage.setItem('studyb_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('studyb_token');
    localStorage.removeItem('studyb_user');
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const updatePreferences = useCallback(async (preferences: UserPreferences) => {
    const res = await authAPI.updatePreferences(preferences);
    const updatedUser = res.data;
    localStorage.setItem('studyb_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, testLogin, register, updatePreferences, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
