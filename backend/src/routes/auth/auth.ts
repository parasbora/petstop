import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { UserService } from '../../services/userService'
import { Env } from '../../app'
import { UserSchema } from '../../schemas/user'
import { handleError, successResponse } from '../../utils/response'
import { Logger } from '../../utils/logger'
import { rateLimitMiddleware } from '../middleware/rateLimit'
import { setCookie } from 'hono/cookie'
const auth = new Hono<Env>()

// Apply rate limiting middleware
auth.post('/login', rateLimitMiddleware('login'))
auth.post('/signup', rateLimitMiddleware('signup'))

auth.post('/signup', async (c) => {

  const userService = new UserService(c.get('prisma'))
  const body = await c.req.json()

  const { success, data, error } = UserSchema.safeParse(body)
  if (!success) {
    Logger.warn('Invalid signup data', { errors: error.errors })
    return handleError(c, error, error.errors[0].message, 400)
  }

  try {
    const existingUser = await userService.findByEmail(data.email)
    if (existingUser) {
      Logger.warn('Email already registered', { email: data.email })
      return handleError(c, null, "Email already registered", 403)
    }

    const user = await userService.create(data)
    if (!user) {
      return handleError(c, null, "Failed to create user", 500)
    }

    const jwt = await sign({
      id: user.id,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    }, c.env.JWT_SECRET)
    await setCookie(c, 'auth_token', jwt, {
      httpOnly: true,
      secure: true, // true in production
      sameSite: 'None', // or 'None' if cross-domain
      maxAge: 24 * 60 * 60,
    })
    return successResponse(c, { user }, "User created successfully")
  } catch (e) {
    return handleError(c, e, "Failed to create user")
  }
})

auth.post('/login', async (c) => {
  const userService = new UserService(c.get('prisma'))
  const body = await c.req.json()

  const { success, data, error } = UserSchema.safeParse(body)
  if (!success) {
    Logger.warn('Invalid login data', { errors: error.errors })
    return handleError(c, error, error.errors[0].message, 400)
  }

  try {
    const user = await userService.findByEmail(data.email)
    if (!user) {
      Logger.warn('User not found during login', { email: data.email })
      return handleError(c, null, "Invalid email or password", 401)
    }

    const validPassword = await userService.verifyPassword(user, data.password)
    if (!validPassword) {
      Logger.warn('Invalid password attempt', { userId: user.id })
      return handleError(c, null, "Invalid email or password", 401)
    }

    const jwt = await sign({
      id: user.id,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    }, c.env.JWT_SECRET)

    await setCookie(c, 'auth_token', jwt, {
      httpOnly: true,
      secure: true, // true in production
      sameSite: 'None', // or 'None' if cross-domain
      maxAge: 24 * 60 * 60,
    })
    // Never expose the password hash to the client
    const { password, ...publicUser } = user
    return successResponse(c, { user: publicUser }, "User logged in successfully")
  } catch (e) {
    return handleError(c, e, "Authentication failed")
  }
})

auth.post('/logout', async (c) => {
  await setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: 0,
  })
  return successResponse(c, null, "Logged out successfully")
})

export default auth 