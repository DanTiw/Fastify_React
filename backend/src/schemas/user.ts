import { z } from 'zod';
import { emailRule, nameRule, passwordRule, roleRule } from './common';

export const createUserSchema = z.object({
  email: emailRule,
  password: passwordRule,
  firstName: nameRule,
  lastName: nameRule,
  role: roleRule.default('USER'),
});

export const updateUserSchema = z
  .object({
    firstName: nameRule.optional(),
    lastName: nameRule.optional(),
    role: roleRule.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export const userSelfChangeSchema = z
  .object({
    firstName: nameRule.optional(),
    lastName: nameRule.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

/** @deprecated Use userSelfChangeSchema */
export const userSelfChange = userSelfChangeSchema;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(200).optional(),
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: roleRule,
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const paginatedUsersSchema = z.object({
  items: z.array(userResponseSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type UserSelfChange = z.infer<typeof userSelfChangeSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
