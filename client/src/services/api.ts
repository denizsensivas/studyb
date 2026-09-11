import axios from 'axios';
import type { AuthResponse, LoginInput, RegisterInput, User, UserPreferences } from '../hooks/authTypes';

interface ApiErrorResponse {
  error?: string;
}

interface DailyEntryResponse {
  todayTotal: number;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;
  return error.response?.data?.error || fallback;
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyb_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('studyb_token');
      localStorage.removeItem('studyb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const authAPI = {
  register: (data: RegisterInput) =>
    api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginInput) =>
    api.post<AuthResponse>('/auth/login', data),
  testLogin: () =>
    api.post<AuthResponse>('/auth/test-login'),
  getProfile: () =>
    api.get<User>('/auth/profile'),
  updatePreferences: (preferences: UserPreferences) =>
    api.patch<User>('/auth/preferences', { preferences }),
};

// ── Subjects ──
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  search: (q: string) => api.get(`/subjects/search?q=${encodeURIComponent(q)}`),
  create: (name: string) => api.post('/subjects', { name }),
};

// ── Daily Entry ──
export const dailyEntryAPI = {
  create: (data: { subjectId?: string; subjectName?: string; correct: number; wrong: number }) =>
    api.post<DailyEntryResponse>('/daily-entry', data),
  getAll: () => api.get('/daily-entry'),
  getToday: () => api.get('/daily-entry/today'),
};

// ── Pomodoro ──
export const pomodoroAPI = {
  create: (duration: number, subjectId?: string, subjectName?: string) => 
    api.post('/pomodoro', { duration, subjectId, subjectName }),
  getAll: () => api.get('/pomodoro'),
  getStats: () => api.get('/pomodoro/stats'),
};

// ── Exam ──
export const examAPI = {
  create: (data: { totalDuration: number; questions: { questionNo: number; timeSpent: number }[] }) =>
    api.post('/exam', data),
  getAll: () => api.get('/exam'),
  getById: (id: string) => api.get(`/exam/${id}`),
};

// ── Analytics ──
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

// ── Leaderboard ──
export const leaderboardAPI = {
  getGlobal: (sortBy?: string) => api.get('/leaderboard/global', { params: { sortBy } }),
  getByLevel: (level: string, sortBy?: string) => api.get(`/leaderboard/level/${level}`, { params: { sortBy } }),
};

// ── Documents ──
export const documentAPI = {
  getAll: () => api.get('/documents'),
  getStorageUsage: () => api.get('/documents/storage'),
  upload: (file: File, title?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  download: (id: string) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

// ── Study Sessions ──
export const studySessionAPI = {
  create: (data: { subjectId?: string; subjectName?: string; duration: number; notes?: string }) =>
    api.post('/study-sessions', data),
  getAll: () => api.get('/study-sessions'),
  getToday: () => api.get('/study-sessions/today'),
};

export default api;
