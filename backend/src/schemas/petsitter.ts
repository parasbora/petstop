import { z } from 'zod'

export const PetSitterSchema = z.object({
  name: z.string().min(2).max(50),
  bio: z.string().min(10).max(500).optional(),
  experience: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  serviceTypes: z.array(z.string()).optional(),
  availability: z.array(z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  })).optional(),
  location : z.string().min(2)
})

export const PetSitterUpdateSchema = PetSitterSchema.partial().refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
}) 