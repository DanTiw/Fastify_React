import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { ZodError } from 'zod';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './lib/env';
import { AppError } from './lib/errors';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';

export function buildApp() {
  const app = Fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  app.register(cookie);

  app.register(swagger, {
    openapi: { info: { title: 'User Management API', version: '1.0.0' } },
    transform: jsonSchemaTransform,
  });
  app.register(swaggerUi, { routePrefix: '/docs' });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ message: error.message });
    }
    if (error instanceof ZodError) {
      return reply.code(400).send({ message: 'Validation failed', issues: error.issues });
    }
    if (error.validation || error.code === 'FST_ERR_VALIDATION') {
      return reply.code(400).send({ message: 'Validation failed', detail: error.message });
    }
    if (typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ message: error.message });
    }
    request.log.error(error);
    return reply.code(500).send({ message: 'Internal server error' });
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(
    async (api) => {
      await api.register(authRoutes, { prefix: '/auth' });
      await api.register(userRoutes, { prefix: '/users' });
    },
    { prefix: '/api' },
  );

  return app;
}
