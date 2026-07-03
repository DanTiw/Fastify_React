import { api } from '../lib/api';
import { authStore } from './authStore';
import type { User } from '../types';

interface AuthResult {
  accessToken: string;
  user: User;
}

export async function login(email: string, password: string): Promise<void> {
  const { accessToken, user } = await api.post<AuthResult>('/auth/login', { email, password });
  authStore.setAuth(accessToken, user);
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
  }
  authStore.clear();
}

export async function bootstrapAuth(): Promise<void> {
  try {
    const { accessToken, user } = await api.post<AuthResult>('/auth/refresh');
    authStore.setAuth(accessToken, user);
  } catch {
    authStore.clear();
  }
}
