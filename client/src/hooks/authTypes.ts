export type EducationLevel = 'PRIMARY_SCHOOL' | 'HIGH_SCHOOL' | 'UNIVERSITY';

export interface PomodoroDurations {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

export interface UserPreferences {
  autoStartBreaks?: boolean;
  autoStartPomodoros?: boolean;
  longBreakInterval?: number;
  autoCheckTasks?: boolean;
  checkToBottom?: boolean;
  customDurations?: PomodoroDurations;
}

export interface User {
  id: string;
  name: string;
  email: string;
  educationLevel: EducationLevel;
  streak: number;
  totalQuestions: number;
  preferences?: UserPreferences | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
  educationLevel: EducationLevel;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  testLogin: () => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
  logout: () => void;
}
