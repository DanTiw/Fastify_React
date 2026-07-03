import { useSyncExternalStore } from 'react';
import { authStore } from './authStore';

export function useAuth() {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);
  return {
    user: state.user,
    isAuthenticated: state.token !== null,
    isAdmin: state.user?.role === 'ADMIN',
  };
}
