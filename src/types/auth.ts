export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  username: string;
  tenantId: string;
  roles: string[];
  expiresInMs: number;
}