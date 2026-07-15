import Fastify, { type FastifyError } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './lib/env';
import { AppError } from './lib/errors';
import { toValidationErrorResponse } from './lib/validation';
import { userRoutes } from './routes/users';
import { withSession } from './plugins/auth-hooks';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from './lib/auth';

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

    const validation = toValidationErrorResponse(error);
    if (validation) {
      return reply.code(400).send(validation);
    }

    if (typeof error.statusCode === 'number' && error.statusCode >= 400 && error.statusCode < 500) {
      return reply.code(error.statusCode).send({ message: error.message });
    }

    request.log.error(error);
    return reply.code(500).send({ message: 'Internal server error' });
  });

  app.get('/health', async () => ({ status: 'ok' }));

  app.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      try {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const headers = fromNodeHeaders(request.headers);

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          ...(request.body ? { body: JSON.stringify(request.body) } : {}),
        });

        const response = await auth.handler(req);

        reply.status(response.status);
        response.headers.forEach((value, key) => {
          reply.header(key, value);
        });
        return reply.send(response.body ? await response.text() : null);
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({
          error: 'Internal authentication error',
          code: 'AUTH_FAILURE',
        });
      }
    },
  });

  app.register(
    async (api) => {
      await api.register(withSession);
      await api.register(userRoutes, { prefix: '/users' });
    },
    { prefix: '/api' },
  );

  return app;
}
