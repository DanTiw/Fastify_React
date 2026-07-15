import type { FastifyReply, FastifyRequest } from 'fastify';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../lib/auth';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role?: string;
      firstName?: string;
      lastName?: string;
      isActive?: boolean;
    };
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });

  if (!session) {
    return reply.code(401).send({ message: 'Unauthorized' });
  }

  request.user = {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role as string | undefined,
    firstName: session.user.firstName as string | undefined,
    lastName: session.user.lastName as string | undefined,
    isActive: session.user.isActive as boolean | undefined,
  };
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (request.user?.role !== 'ADMIN') {
    return reply.code(403).send({ message: 'Admin access required' });
  }
}