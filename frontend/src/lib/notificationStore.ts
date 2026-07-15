import { useSyncExternalStore } from 'react';

export type Toast = {
  id: string;
  type: 'success' | 'error';
  message: string;
};

let toasts: Toast[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function push(type: Toast['type'], message: string) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, type, message }];
  emit();
  window.setTimeout(() => notificationStore.dismiss(id), 4000);
}

export const notificationStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return toasts;
  },
  dismiss(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  },
};

export const toast = {
  success(message: string) {
    push('success', message);
  },
  error(message: string) {
    push('error', message);
  },
};

export function useToasts() {
  return useSyncExternalStore(notificationStore.subscribe, notificationStore.getSnapshot);
}
