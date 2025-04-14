import { Hono } from 'hono'
import { UserService } from '../../services/userService'
import { Env } from '../../app'
import { UserUpdateSchema } from '../../schemas/user'
import { handleError, successResponse } from '../../utils/response'
import { Logger } from '../../utils/logger'
import { authMiddleware } from '../middleware/auth'

const users = new Hono<Env>()

// Apply auth middleware to all routes except the root
users.use('*', authMiddleware)
users.get('/', c => c.text('petstop users:'))

// Helper function for ID comparison
const compareIds = (id1: string | number, id2: string | number): boolean => {
  return String(id1) === String(id2)
}

users.get('/:id', async (c) => {
  const userService = new UserService(c.get('prisma'))
  const id = parseInt(c.req.param('id'), 10)
  const userId = c.get('userId')

  Logger.debug('Fetching user profile', { requestedId: id, userId })

  if (!compareIds(userId, id)) {
    Logger.warn('Unauthorized profile access', { requestedId: id, userId })
    return handleError(c, null, "Unauthorized", 403)
  }

  try {
    const userDetails = await userService.findById(id)
    if (!userDetails) {
      Logger.warn('User not found', { userId: id })
      return handleError(c, null, "User not found", 404)
    }
    return successResponse(c, userDetails)
  } catch (err) {
    return handleError(c, err, "Failed to fetch user")
  }
})

users.put("/:id", async (c) => {
  const userService = new UserService(c.get('prisma'))
  const body = await c.req.json()
  const id = parseInt(c.req.param('id'), 10)
  const userId = c.get('userId')

  Logger.info('Updating user profile', { userId: id })

  if (!compareIds(userId, id)) {
    Logger.warn('Unauthorized profile update', { requestedId: id, userId })
    return handleError(c, null, "Unauthorized", 403)
  }

  const { success, data, error } = UserUpdateSchema.safeParse(body)
  if (!success) {
    Logger.warn('Invalid update data', { 
      errors: error.errors,
      userId: id
    })
    return handleError(c, error, error.errors[0].message, 400)
  }

  try {
    const updatedUser = await userService.update(id, data)
    return successResponse(c, updatedUser, "Profile updated successfully")
  } catch (err) {
    return handleError(c, err, "Failed to update profile")
  }
})

export default users 