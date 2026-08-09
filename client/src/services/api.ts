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
  testLogin: () =>
    api.post('/auth/test-login'),
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

// ── Documents ──
export const documentAPI = {
  getAll: () => api.get('/documents'),
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

