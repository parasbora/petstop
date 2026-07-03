import { z } from 'zod'

export const PetSitterSchema = z.object({
  name: z.string().min(2).max(50),
  bio: z.string().min(10).max(500).optional(),
  experience: z.number().int().min(0).max(60).optional(),
  hourlyRate: z.number().min(0).max(5000).optional(),
  serviceTypes: z.array(z.string().min(1).max(30)).max(10).optional(),
  petTypes: z.array(z.enum(['dog', 'cat'])).max(2).optional(),
  availability: z.array(z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  })).optional(),
  location: z.string().min(2).max(100)
})

// Availability is managed via the dedicated POST /:id/availability endpoint,
// not through profile updates (it's a relation, not a scalar column).
export const PetSitterUpdateSchema = PetSitterSchema.omit({ availability: true })
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
  }) 