import { notificationStore, useToasts, type Toast } from '../lib/notificationStore';

export function Toaster() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  );
}

const styles: Record<Toast['type'], { container: string; icon: string }> = {
  success: { container: 'border-green-200 bg-green-50 text-green-800', icon: '✓' },
  error: { container: 'border-red-200 bg-red-50 text-red-800', icon: '✕' },
};

function ToastCard({ toast }: { toast: Toast }) {
  const s = styles[toast.type];
  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-sm ${s.container}`}
    >
      <span aria-hidden className="font-semibold">
        {s.icon}
      </span>
      <p className="flex-1 break-words">{toast.message}</p>
      <button
        onClick={() => notificationStore.dismiss(toast.id)}
        className="opacity-60 transition hover:opacity-100"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}
