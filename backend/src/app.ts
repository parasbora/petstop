import { Hono } from 'hono'

import { routes } from './routes';
import { logger } from 'hono/logger'
import { showRoutes } from 'hono/dev';
import { prismaMiddleware } from './routes/middleware/prisma';
import { cors } from 'hono/cors'


export type Env = {
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    userId: string
    prisma: any
  }
}

const app = new Hono<Env>()
  .use(logger())
  // Handle CORS and preflight early
  .use('*', cors({
    origin: '*',
    allowMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['*'],
  }))
  .use('*', prismaMiddleware)
  .basePath("/api")

routes(app)


app.get('/health', c => {
  return c.json({ message: 'petstop backend is up and running' });
});

showRoutes(app, {
  verbose: true,
})

export default app

// (CORS already applied above)


