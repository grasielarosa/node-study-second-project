import { FastifyInstance } from 'fastify'
import { createMealBodySchema } from '../@models/schemas'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId
      if (!sessionId) {
        return reply.status(401).send('Unauthorized: No session found')
      }
      const user = await knex('users').where({ session_id: sessionId }).first()
      if (!user) {
        return reply.status(401).send('Unauthorized: Invalid session')
      }
      const userId = user.id
      const meals = await knex('meals').where({ user_id: userId })
      return { meals }
    }
  )
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const body = createMealBodySchema.safeParse(request.body)
      if (!body.success) {
        return reply.status(400).send('Invalid request body')
      }

      const { name, description, date, time, isWithinDiet } = body.data
      const sessionId = request.cookies.sessionId
      if (!sessionId) {
        return reply.status(401).send('Unauthorized: No session found')
      }
      const user = await knex('users').where({ session_id: sessionId }).first()
      if (!user) {
        return reply.status(401).send('Unauthorized: Invalid session')
      }
      const userId = user.id
      await knex('meals').insert({
        id: crypto.randomUUID(),
        name,
        description,
        date,
        time,
        isWithinDiet,
        user_id: userId,
      })

      return reply.status(201).send()
    }
  )
}
