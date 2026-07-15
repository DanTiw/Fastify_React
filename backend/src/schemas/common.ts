import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().trim().min(1, 'id is required').max(128),
});

export type IdParam = z.infer<typeof idParamSchema>;

export const emailRule = z.string().trim().email('Invalid email address').max(255);
export const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');
export const nameRule = z.string().trim().min(1, 'Required').max(100, 'Must be at most 100 characters');
export const roleRule = z.enum(['ADMIN', 'USER']);

export const validationIssueSchema = z.object({
  path: z.string(),
  message: z.string(),
  code: z.string().optional(),
});

export const validationErrorResponseSchema = z.object({
  message: z.literal('Validation failed'),
  issues: z.array(validationIssueSchema),
});

export type ValidationIssue = z.infer<typeof validationIssueSchema>;
export type ValidationErrorResponse = z.infer<typeof validationErrorResponseSchema>;

export const errorMessageSchema = z.object({
  message: z.string(),
});
