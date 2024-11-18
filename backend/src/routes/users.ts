import { Hono } from 'hono'


type Env = {
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    userId: string
  }
  strict: false
}


const users = new Hono<Env>()




users.get('/', c => c.text('petstop users:')) // GET /user

export default users