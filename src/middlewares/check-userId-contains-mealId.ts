import { FastifyReply, FastifyRequest } from 'fastify'

import { CustomRequest, Meal, User } from '../@models/types'
import { knex } from '../database'

export const checkValidMealIdRequest = async (request: CustomRequest, reply: FastifyReply) => {
  const { id: mealId } = request.params as { id: string }

  if (!mealId) {
    return reply.status(400).send({ error: 'Invalid meal id' })
  }

  const session_id = request.cookies.sessionId

  if (!session_id) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const user = await knex('users').where({ session_id }).first()

  if (!user) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }
  const meal = await knex('meals').where({ id: mealId }).first()

  if (!meal || meal.user_id !== user.id) {
    return reply.status(403).send({ error: 'Forbidden' })
  }
  request.user = user
  request.meal = meal
}
