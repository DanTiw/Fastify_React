import crypto from 'node:crypto';
import { prisma } from '../lib/prisma';
import { verifyPassword } from '../lib/password';
import { signAccessToken } from '../lib/jwt';
import { env } from '../lib/env';
import { AppError } from '../lib/errors';
import { toUserResponse } from './userService';

function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function issueRefreshToken(userId: string): Promise<string> {
  const raw = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(raw),
      userId,
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL * 1000),
    },
  });
  return raw;
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(user.passwordHash, password))) {
    throw new AppError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new AppError(403, 'Account is deactivated');

  return {
    accessToken: signAccessToken({ sub: user.id, role: user.role }),
    refreshToken: await issueRefreshToken(user.id),
    user: toUserResponse(user),
  };
}

export async function refresh(rawToken: string) {
  if (!rawToken) throw new AppError(401, 'Missing refresh token');

  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });
  if (!record) throw new AppError(401, 'Invalid refresh token');

  if (record.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError(401, 'Refresh token reuse detected — please log in again');
  }

  if (record.expiresAt < new Date()) throw new AppError(401, 'Refresh token expired');

  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });

  return {
    accessToken: signAccessToken({ sub: record.user.id, role: record.user.role }),
    refreshToken: await issueRefreshToken(record.userId),
    user: toUserResponse(record.user),
  };
}

export async function logout(rawToken: string | undefined): Promise<void> {
  if (!rawToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
