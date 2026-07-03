import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserValues } from './userSchema';
import { api, ApiError } from '../lib/api';
import { toast } from '../lib/notificationStore';
import type { User } from '../types';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export function CreateUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    mode: 'onTouched',
    defaultValues: { role: 'USER' },
  });

  async function onSubmit(values: CreateUserValues) {
    setServerError(null);
    try {
      const created = await api.post<User>('/users', values);
      toast.success(`Created ${created.email}`);
      onSaved();
    } catch (e) {
      setServerError(e instanceof ApiError ? e.message : 'Failed to create user');
    }
  }

  return (
    <Modal title="Add user" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" {...register('firstName')} error={errors.firstName?.message} />
          <Input label="Last name" {...register('lastName')} error={errors.lastName?.message} />
        </div>
        <Input label="Temporary password" type="password" {...register('password')} error={errors.password?.message} />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">Role</span>
          <select {...register('role')} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
