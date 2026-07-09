import { request } from './request';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export const login = (data: LoginRequest): Promise<LoginResponse> =>
  request.post('/public/auth/login', data);
