import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../lib/errors';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery, UserResponse, UserSelfChange } from '../schemas/user';
import { auth } from '../lib/auth';

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function listUsers(query: ListUsersQuery) {
  const { page, pageSize, search } = query;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return { items: items.map(toUserResponse), total, page, pageSize };
}

export async function getUserById(id: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'User not found');
  return toUserResponse(user);
}

export async function createUser(input: CreateUserInput): Promise<UserResponse> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError(409, 'A user with this email already exists');

  const result = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: `${input.firstName} ${input.lastName}`.trim(),
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      isActive: true,
    },
  });

  const userId = result.user.id;
  return getUserById(userId);
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserResponse> {
  await getUserById(id);
  const user = await prisma.user.update({ where: { id }, data: input });
  return toUserResponse(user);
}

export async function updateUserSelf(id: string, input: UserSelfChange): Promise<UserResponse> {
  await getUserById(id);
  const user = await prisma.user.update({ where: { id }, data: input });
  return toUserResponse(user);
}

export async function deleteUser(id: string, currentUserId: string): Promise<void> {
  if (id === currentUserId) throw new AppError(400, 'You cannot delete your own account');
  await getUserById(id);
  await prisma.user.delete({ where: { id } });
}
