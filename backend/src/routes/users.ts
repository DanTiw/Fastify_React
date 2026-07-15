import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  userResponseSchema,
  paginatedUsersSchema,
  userSelfChangeSchema,
} from '../schemas/user';
import { idParamSchema, validationErrorResponseSchema, errorMessageSchema } from '../schemas/common';
import { withAdmin } from '../plugins/auth-hooks';
import { listUsers, getUserById, createUser, updateUser, updateUserSelf, deleteUser } from '../services/userService';

const validationResponses = {
  400: validationErrorResponseSchema,
  401: errorMessageSchema,
  403: errorMessageSchema,
} as const;

export async function userRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.get(
    '/',
    {
      schema: {
        tags: ['users'],
        querystring: listUsersQuerySchema,
        response: { 200: paginatedUsersSchema, ...validationResponses },
      },
    },
    async (request) => listUsers(request.query),
  );

  r.get(
    '/:id',
    {
      schema: {
        tags: ['users'],
        params: idParamSchema,
        response: { 200: userResponseSchema, 404: errorMessageSchema, ...validationResponses },
      },
    },
    async (request) => getUserById(request.params.id),
  );

  r.patch(
    '/self',
    {
      schema: {
        tags: ['users'],
        body: userSelfChangeSchema,
        response: { 200: userResponseSchema, ...validationResponses },
      },
    },
    async (request) => updateUserSelf(request.user!.id, request.body),
  );

  await r.register(async (adminScope) => {
    await adminScope.register(withAdmin);
    const admin = adminScope.withTypeProvider<ZodTypeProvider>();

    admin.post(
      '/',
      {
        schema: {
          tags: ['users'],
          body: createUserSchema,
          response: {
            201: userResponseSchema,
            409: errorMessageSchema,
            ...validationResponses,
          },
        },
      },
      async (request, reply) => reply.code(201).send(await createUser(request.body)),
    );

    admin.patch(
      '/:id',
      {
        schema: {
          tags: ['users'],
          params: idParamSchema,
          body: updateUserSchema,
          response: { 200: userResponseSchema, 404: errorMessageSchema, ...validationResponses },
        },
      },
      async (request) => updateUser(request.params.id, request.body),
    );

    admin.delete(
      '/:id',
      {
        schema: {
          tags: ['users'],
          params: idParamSchema,
        },
      },
      async (request, reply) => {
        await deleteUser(request.params.id, request.user!.id);
        return reply.status(204).send();
      },
    );
  });
}
