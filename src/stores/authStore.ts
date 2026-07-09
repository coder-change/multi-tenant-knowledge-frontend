import { create } from 'zustand';
import type { LoginResponse } from '@/types/auth';
import { storage } from '@/utils/storage';

const STORAGE_KEY = 'kb-auth';

interface PersistedAuth {
  token: string;
  user: LoginResponse;
}

interface AuthState {
  token: string | null;
  user: LoginResponse | null;
  isAuthenticated: boolean;
  setAuth: (data: LoginResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (data) => {
    const token = data.token;
    storage.setItem<PersistedAuth>(STORAGE_KEY, { token, user: data });
    set({ token, user: data, isAuthenticated: true });
  },

  clearAuth: () => {
    storage.removeItem(STORAGE_KEY);
    set({ token: null, user: null, isAuthenticated: false });
  },
}));

/**
 * 从 localStorage 初始化 store（应用启动时调用一次）
 */
export const initAuthFromStorage = () => {
  const persisted = storage.getItem<PersistedAuth>(STORAGE_KEY);
  if (persisted?.token && persisted.user) {
    useAuthStore.setState({
      token: persisted.token,
      user: persisted.user,
      isAuthenticated: true,
    });
  }
};
