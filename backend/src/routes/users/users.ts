// src/routes/users/index.ts
import { Hono } from 'hono'
import { UserService } from '../../services/userService'
import { Env } from '../../app'
import { UserUpdateSchema } from '../../schemas/user'
import { handleError, successResponse } from '../../utils/response'
import { Logger } from '../../utils/logger'
import { authMiddleware } from '../middleware/auth'

const users = new Hono<Env>()

// Apply auth middleware to all routes
users.use('*', authMiddleware)

// GET /users/me  → Fetch own profile
users.get('/me', async (c) => {
  const userService = new UserService(c.get('prisma'))
  const userId = c.get('userId')
console.log("===============",userId)
  Logger.debug('Fetching own profile', { userId })
  console.log("===============",userId)
  try {
    const userDetails = await userService.findById(Number(userId))

    if (!userDetails) {
      Logger.warn('User not found', { userId })
      return handleError(c, null, "User not found", 404)
    }

    return successResponse(c, userDetails)
  } catch (err) {
    return handleError(c, err, "Failed to fetch profile")
  }
})

// PUT /users/me → Update own profile
users.put('/me', async (c) => {
  const userService = new UserService(c.get('prisma'))
  const userId = c.get('userId')

  const body = await c.req.json()
  Logger.info('Updating own profile', { userId })

  const parsed = UserUpdateSchema.safeParse(body)
  if (!parsed.success) {
    Logger.warn('Invalid update data', {
      errors: parsed.error.errors,
      userId
    })
    return handleError(c, parsed.error, parsed.error.errors[0].message, 400)
  }

  try {
    const updatedUser = await userService.update(Number(userId), parsed.data)
    return successResponse(c, updatedUser, "Profile updated successfully")
  } catch (err) {
    return handleError(c, err, "Failed to update profile")
  }
})

export default users
