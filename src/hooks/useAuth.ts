import { useAuthStore } from '@/stores/authStore';
import type { LoginResponse } from '@/types/auth';
import { login as loginApi } from '@/api/auth';

export const useAuth = () => {
  const { token, user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    const data = await loginApi({ username, password });
    setAuth(data);
    return data;
  };

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const canManageDocuments = (): boolean => hasRole('ADMIN') || hasRole('EDITOR');

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    hasRole,
    canManageDocuments,
  };
};
