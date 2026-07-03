import type { User } from '../types';

interface AuthState {
  token: string | null;
  user: User | null;
}

let state: AuthState = { token: null, user: null };
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
  setAuth(token: string, user: User) {
    setState({ token, user });
  },
  clear() {
    setState({ token: null, user: null });
  },
};
