import { z } from 'zod'

export const petSchema = z.object({
  name: z.string().min(1).max(50),
  species: z.enum(['dog', 'cat']),
  breed: z.string().min(1).max(50),
  age: z.number().int().min(0).max(40),
})

export const petUpdateSchema = petSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
})
