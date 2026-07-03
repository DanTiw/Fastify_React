import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().trim().min(1, 'Required').email('Enter a valid email').max(255, 'Email is too long'),
  firstName: z.string().trim().min(1, 'Required').max(100, 'Keep it under 100 characters'),
  lastName: z.string().trim().min(1, 'Required').max(100, 'Keep it under 100 characters'),
  role: z.enum(['ADMIN', 'USER']),
  password: z.string().min(8, 'At least 8 characters').max(128, 'Too long (max 128)'),
});
export type CreateUserValues = z.infer<typeof createUserSchema>;

export const editUserSchema = z.object({
  firstName: z.string().trim().min(1, 'Required').max(100, 'Keep it under 100 characters'),
  lastName: z.string().trim().min(1, 'Required').max(100, 'Keep it under 100 characters'),
  role: z.enum(['ADMIN', 'USER']),
  isActive: z.boolean(),
});
export type EditUserValues = z.infer<typeof editUserSchema>;
