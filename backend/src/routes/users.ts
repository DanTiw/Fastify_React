import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  userResponseSchema,
  paginatedUsersSchema,
  userSelfChange,
} from '../schemas/user';
import { authenticate, requireAdmin } from '../middleware/auth';
import { listUsers, getUserById, createUser, updateUser, updateUserSelf, deleteUser } from '../services/userService';

const idParam = z.object({ id: z.string().uuid() });

export async function userRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
// Prehandlers auto attach ? DB and Backedn are joint ?
  r.get(
    '/',
    {
      preHandler: [authenticate],
      schema: { tags: ['users'], querystring: listUsersQuerySchema, response: { 200: paginatedUsersSchema } },
    },
    async (request) => listUsers(request.query),
  );

  r.get(
    '/:id',
    { preHandler: [authenticate], schema: { tags: ['users'], params: idParam, response: { 200: userResponseSchema } } },
    async (request) => getUserById(request.params.id),
  );

  r.post(
    '/',
    { preHandler: [authenticate, requireAdmin], schema: { tags: ['users'], body: createUserSchema, response: { 201: userResponseSchema } } },
    async (request, reply) => reply.code(201).send(await createUser(request.body)),
  );

  r.patch(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: { tags: ['users'], params: idParam, body: updateUserSchema, response: { 200: userResponseSchema } },
    },
    async (request) => updateUser(request.params.id, request.body),
  );

  r.delete(
    '/:id',
    { preHandler: [authenticate, requireAdmin], schema: { tags: ['users'], params: idParam } },
    async (request, reply) => {
      await deleteUser(request.params.id, request.user!.sub);
      return reply.code(204).send();
    },
  );

  r.patch(
    '/self',
    {
      preHandler: [authenticate],
      schema: { tags: ['users'], body: userSelfChange, response: { 200: userResponseSchema } },
    },
    async (request) => updateUserSelf(request.user!.sub, request.body),
  );
}
