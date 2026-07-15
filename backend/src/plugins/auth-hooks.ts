import type { FastifyPluginAsync } from 'fastify';
import { authenticate, requireAdmin } from '../middleware/auth';

export const withSession: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', authenticate);
};

export const withAdmin: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireAdmin);
};
