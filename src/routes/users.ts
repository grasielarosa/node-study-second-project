import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { createUserBodySchema } from '../@models/schemas'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const body = createUserBodySchema.safeParse(request.body)

    if (!body.success) {
      return reply.status(400).send('Invalid request body')
    }
    const { name, email } = body.data

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = crypto.randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      session_id: sessionId,
    })

    return reply.status(201).send({
      message: 'User created',
    })
  })
}
