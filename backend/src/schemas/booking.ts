import { z } from 'zod'

export const createBookingSchema = z
  .object({
    petSitterId: z.number().int().positive(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    message: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  })

export const updateBookingStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED']),
})
