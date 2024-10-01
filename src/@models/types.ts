import { FastifyRequest } from 'fastify'

export type User = {
  id: string
  name: string
  email: number
  session_id?: string
  created_at: Date
}

export type Meal = {
  id: string
  name: string
  description?: string
  date: string
  time: string
  isWithinDiet: boolean
  user_id: string
  created_at?: Date
}

export interface CustomRequest extends FastifyRequest {
  user?: User
  meal?: Meal
}
