import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login } from './authActions';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: 'onTouched' });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    try {
      await login(values.email, values.password);
      navigate('/users');
    } catch {
      setServerError('Invalid email or password');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-gray-900">Sign in</h1>
        <p className="mb-6 text-sm text-gray-500">Seeded admin: admin@example.com / Password123!</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            error={errors.password?.message}
          />
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
