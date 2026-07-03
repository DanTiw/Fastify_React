import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { loginSchema } from '../schemas/auth';
import { userResponseSchema } from '../schemas/user';
import * as authService from '../services/authService';
import { getUserById } from '../services/userService';
import { authenticate } from '../middleware/auth';
import { env } from '../lib/env';

const REFRESH_COOKIE = 'refreshToken';

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.COOKIE_SECURE,
  path: '/api/auth',
  maxAge: env.REFRESH_TOKEN_TTL,
};

export async function authRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.post(
    '/login',
    {
      schema: {
        tags: ['auth'],
        body: loginSchema,
        response: { 200: z.object({ accessToken: z.string(), user: userResponseSchema }) },
      },
    },
    async (request, reply) => {
      const { accessToken, refreshToken, user } = await authService.login(
        request.body.email,
        request.body.password,
      );
      reply.setCookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
      return { accessToken, user };
    },
  );

  r.post(
    '/refresh',
    { schema: { tags: ['auth'], response: { 200: z.object({ accessToken: z.string(), user: userResponseSchema }) } } },
    async (request, reply) => {
      const { accessToken, refreshToken, user } = await authService.refresh(
        request.cookies[REFRESH_COOKIE] ?? '',
      );
      reply.setCookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
      return { accessToken, user };
    },
  );

  r.post(
    '/logout',
    { schema: { tags: ['auth'], response: { 200: z.object({ success: z.boolean() }) } } },
    async (request, reply) => {
      await authService.logout(request.cookies[REFRESH_COOKIE]);
      reply.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
      return { success: true };
    },
  );

  r.get(
    '/me',
    { preHandler: [authenticate], schema: { tags: ['auth'], response: { 200: userResponseSchema } } },
    async (request) => getUserById(request.user!.sub),
  );
}
