import { z } from 'zod';

const passwordRule = z.string().min(8, 'Password must be at least 8 characters').max(128);

const nameRule = z.string().trim().min(1).max(100);

export const createUserSchema = z.object({
  email: z.string().trim().email().max(255),
  password: passwordRule,
  firstName: nameRule,
  lastName: nameRule,
  role: z.enum(['ADMIN', 'USER']).default('USER'),
});

export const updateUserSchema = z.object({
  firstName: nameRule.optional(),
  lastName: nameRule.optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  isActive: z.boolean().optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['ADMIN', 'USER']),
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


export const userSelfChange = z.object({
  firstName: nameRule.optional(),
  lastName: nameRule.optional(),
});

export type UserSelfChange = z.infer<typeof userSelfChange>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
