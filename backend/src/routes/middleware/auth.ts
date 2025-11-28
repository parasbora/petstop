
import { verify } from 'hono/jwt'
import { Logger } from '../../utils/logger'
import { handleError } from '../../utils/response'

export const authMiddleware = async (c: any, next: Function) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      Logger.warn('No auth token provided')
      return handleError(c, null, 'No auth token provided', 401)
    }

    const token = authHeader.split(' ')[1]
    const payload = await verify(token, c.env.JWT_SECRET)
    
    if (!payload || !payload.id) {
      Logger.warn('Invalid token payload')
      return handleError(c, null, 'Invalid token', 401)
    }

    // Set userId in context for use in routes
    c.set('userId', payload.id)
    await next()
  } catch (error) {
    Logger.error('Auth middleware error', error as Error)
    return handleError(c, error, 'Invalid token', 401)
  }
}