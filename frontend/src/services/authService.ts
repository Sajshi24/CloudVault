import api from './api';
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from './types';

export const TOKEN_KEY = 'cloudvault_token';

export const authService = {
  // Backend: POST /auth/login — returns { access_token, token_type }
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  // Backend: POST /auth/register — returns UserResponse (same shape as AuthUser)
  // Registration does NOT return a token — the user must log in separately.
  async register(payload: RegisterPayload): Promise<AuthUser> {
    const { data } = await api.post<AuthUser>('/auth/register', payload);
    return data;
  },

  // Backend: GET /auth/me — returns UserResponse
  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me');
    return data;
  },

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },
};
