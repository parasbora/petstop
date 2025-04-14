import { z } from 'zod'

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50).optional(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
})

export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
}) 