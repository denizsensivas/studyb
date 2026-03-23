import axios from 'axios';

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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('studyb_token');
      localStorage.removeItem('studyb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const authAPI = {
  register: (data: { name: string; email: string; password: string; educationLevel: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () =>
    api.get('/auth/profile'),
  updatePreferences: (preferences: any) =>
    api.patch('/auth/preferences', { preferences }),
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
    api.post('/daily-entry', data),
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

export default api;
