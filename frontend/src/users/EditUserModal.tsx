import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editUserSchema, type EditUserValues } from './userSchema';
import { api, ApiError } from '../lib/api';
import { toast } from '../lib/notificationStore';
import type { User } from '../types';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    mode: 'onTouched',
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    },
  });

  async function onSubmit(values: EditUserValues) {
    setServerError(null);
    try {
      const updated = await api.patch<User>(`/users/${user.id}`, values);
      toast.success(`Updated ${updated.email}`);
      onSaved();
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Failed to update user');
    }
  }

  return (
    <Modal title={`Edit ${user.email}`} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" {...register('firstName')} error={errors.firstName?.message} />
          <Input label="Last name" {...register('lastName')} error={errors.lastName?.message} />
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Role</span>
          <select {...register('role')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" {...register('isActive')} className="h-4 w-4" />
          Active (inactive users can't log in)
        </label>
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
