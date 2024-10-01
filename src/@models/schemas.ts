import { z } from 'zod'

export const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

export const createMealBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  date: z.string().refine(
    (val) => {
      return /^\d{2}-\d{2}-\d{4}$/.test(val)
    },
    {
      message: 'Invalid date format. Expected format: DD-MM-YYYY.',
    }
  ),
  time: z.string().refine(
    (val) => {
      return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(val)
    },
    {
      message: 'Invalid time format. Expected HH:MM.',
    }
  ),
  isWithinDiet: z.boolean(),
})
