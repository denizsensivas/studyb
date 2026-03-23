import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  educationLevel: string;
  streak: number;
  totalQuestions: number;
  preferences?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; educationLevel: string }) => Promise<void>;
  updatePreferences: (preferences: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('studyb_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI
        .getProfile()
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          localStorage.removeItem('studyb_token');
          localStorage.removeItem('studyb_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem('studyb_token', newToken);
    localStorage.setItem('studyb_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const register = async (data: { name: string; email: string; password: string; educationLevel: string }) => {
    const res = await authAPI.register(data);
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem('studyb_token', newToken);
    localStorage.setItem('studyb_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('studyb_token');
    localStorage.removeItem('studyb_user');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (preferences: any) => {
    const res = await authAPI.updatePreferences(preferences);
    const updatedUser = res.data;
    localStorage.setItem('studyb_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, updatePreferences, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
