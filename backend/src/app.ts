import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'
import { routes } from './routes';
import { logger } from 'hono/logger'
import { showRoutes } from 'hono/dev';
import { prismaMiddleware } from './routes/middleware/prisma';
import { cors } from 'hono/cors'

export const getPrisma = (database_url: string) => {
  const prisma = new PrismaClient({
    datasourceUrl: database_url,
  }).$extends(withAccelerate())
  return prisma
}

export type Env = {
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    userId: string
    prisma: PrismaClient
  }
}

const app = new Hono<Env>()
  .use(logger())
  // Handle CORS and preflight early
  .use('*', cors({
    origin: '*',
    allowMethods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowHeaders: ['*'],
  }))
  .use('*', prismaMiddleware)
  .basePath("/api")

routes(app)


app.get('/', c => {
  return c.json({ message: 'app.ts is up' });
});

showRoutes(app, {
  verbose: true,
})

export default app

// (CORS already applied above)


