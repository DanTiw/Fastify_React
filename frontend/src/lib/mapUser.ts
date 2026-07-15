import type { Role, User } from '../types';

export function mapSessionUser(raw: Record<string, unknown>): User {
  const role = raw.role === 'ADMIN' || raw.role === 'USER' ? (raw.role as Role) : 'USER';

  const createdAt = toIso(raw.createdAt);
  const updatedAt = toIso(raw.updatedAt);

  return {
    id: String(raw.id ?? ''),
    email: String(raw.email ?? ''),
    firstName: String(raw.firstName ?? ''),
    lastName: String(raw.lastName ?? ''),
    role,
    isActive: raw.isActive !== false,
    createdAt,
    updatedAt,
  };
}

function toIso(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'number') return new Date(value).toISOString();
  return new Date().toISOString();
}
