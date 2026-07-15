import type { User } from '../types';

interface AuthState {
  user: User | null;
  hydrated: boolean;
}

let state: AuthState = { user: null, hydrated: false };
const listeners = new Set<() => void>();

function setState(next: AuthState) {
  state = next;
  listeners.forEach((notify) => notify());
}

export const authStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): AuthState {
    return state;
  },
  setUser(user: User) {
    setState({ user, hydrated: true });
  },
  clear() {
    setState({ user: null, hydrated: true });
  },
  markHydrated() {
    setState({ ...state, hydrated: true });
  },
};
