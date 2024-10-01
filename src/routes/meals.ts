import { FastifyInstance } from 'fastify'
import { createMealBodySchema } from '../@models/schemas'
import { knex } from '../database'
import { checkSessionIdExists, checkValidMealIdRequest } from '../middlewares'
import { CustomRequest, Meal } from '../@models/types'

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

  app.put('/:id', { preHandler: checkValidMealIdRequest }, async (request: CustomRequest, reply) => {
    const { meal } = request
    const body = request.body as Partial<Meal>

    if (!meal) {
      return reply.status(404).send({ error: 'Meal not found' })
    }

    const { name, description, isWithinDiet, date, time } = createMealBodySchema.parse(body)
    try {
      await knex('meals').where({ id: meal.id }).update({
        name,
        description,
        isWithinDiet,
        date,
        time,
      })

      return reply.status(200).send('Meal updated successfully')
    } catch (error) {
      console.error(error)
      return reply.status(500).send('Internal Server Error')
    }
  })
}
