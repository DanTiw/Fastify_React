import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'primary' | 'danger';
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-gray-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="button" variant={variant} onClick={handleConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
