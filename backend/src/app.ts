import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate'


export const getPrisma = (database_url: string) => {
  const prisma = new PrismaClient({
    datasourceUrl: database_url,
  }).$extends(withAccelerate())
  return prisma
}

type Env={
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    userId: string
  }
  strict: false
}

const app = new Hono<Env>()
  .basePath("/api")



app.get('/', c => {
  return c.json({ message: 'app.ts is up' });
});

export default app


