import { authClient } from '../lib/auth-client';
import { mapSessionUser } from '../lib/mapUser';
import { authStore } from './authStore';

export async function login(email: string, password: string): Promise<void> {
  const { error } = await authClient.signIn.email({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || 'Invalid email or password');
  }

  await loadSessionIntoStore();
}

export async function logout(): Promise<void> {
  try {
    await authClient.signOut();
  } catch {
  }
  authStore.clear();
}

export async function bootstrapAuth(): Promise<void> {
  try {
    await loadSessionIntoStore();
  } catch {
    authStore.clear();
  } finally {
    authStore.markHydrated();
  }
}

async function loadSessionIntoStore(): Promise<void> {
  const { data, error } = await authClient.getSession();

  if (error || !data?.session || !data.user) {
    authStore.clear();
    return;
  }

  authStore.setUser(mapSessionUser(data.user as unknown as Record<string, unknown>));
}
