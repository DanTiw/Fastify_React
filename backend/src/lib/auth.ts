import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma';
import { env } from './env';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      firstName: { type: 'string', required: true, defaultValue: '' },
      lastName:  { type: 'string', required: true, defaultValue: '' },
      role:      { type: 'string', required: true, defaultValue: 'USER' },
      isActive:  { type: 'boolean', required: true, defaultValue: true },
    },
  },
});

export type Auth = typeof auth;