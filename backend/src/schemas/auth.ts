import { z } from 'zod';
import { emailRule } from './common';

/** Reusable shape if app-owned auth routes are added (better-auth validates /api/auth/*). */
export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
