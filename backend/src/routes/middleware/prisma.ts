import { MiddlewareHandler } from 'hono'
import { getPrisma } from '../../utils/prismaFunction'

export const prismaMiddleware: MiddlewareHandler = async (c, next) => {
  const prisma = getPrisma(c.env.DATABASE_URL)
  c.set('prisma', prisma)
  await next()
} 