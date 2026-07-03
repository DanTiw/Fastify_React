import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken, type AccessTokenPayload } from '../lib/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AccessTokenPayload;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.code(401).send({ message: 'Missing or invalid Authorization headerz' });
  }
  try {
    request.user = verifyAccessToken(header.slice('Bearer '.length));
  } catch {
    return reply.code(401).send({ message: 'Invalid or expired token' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  if (request.user?.role !== 'ADMIN') {
    return reply.code(403).send({ message: 'Admin  access required' });
  }
}


