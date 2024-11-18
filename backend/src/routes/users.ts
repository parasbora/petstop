import { Hono } from 'hono'

import { sign, verify } from 'hono/jwt'
import { getPrisma } from '../utils/prismaFunction'

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
users.post('/signup', async (c) => {

  const prisma = getPrisma(c.env?.DATABASE_URL)
  const body = await c.req.json()

  const checkDuplicate = await prisma.user.findUnique({
    where: {
      email: body.email
    }
  });
  if (checkDuplicate) {
    c.status(403);
    return c.json({ error: "email already registered" });
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: body.password
      }
    });

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt })
  } catch (e) {
    return c.status(403)
  }
})

users.post('/login', async (c) => {
  const prisma = getPrisma(c.env?.DATABASE_URL)
  const body = await c.req.json()
  const user = await prisma.user.findUnique({
    where: { email: body.email, password: body.password },
  })

  if(!user){
    c.status(404)
    return c.json({ error: "user not found" })
  }
  try{
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json(jwt)
  }catch(e){
    return c.status(403)
  }
  
}) // GET /user




users.get('/:id',async (c)=> {
  const prisma = getPrisma(c.env?.DATABASE_URL)
  const authHeader = c.req.header('Authorization')

  if (!authHeader) {
    return c.text('Unauthorized', 401)  
  }
  const token = authHeader.split(' ')[1]

  if (!token) {
    return c.text('Unauthorized', 401)  
  }
  try {
    // Verify the token using the secret
    await verify(token, c.env.JWT_SECRET)
    // Now, check if the `id` from the URL matches the `id` from the token (security measure)
    const id = parseInt(c.req.param('id'), 10)
    // Fetch the user details from the database
    const userDetails = await prisma.user.findUnique({
      where: { id: id }
    })

    if (!userDetails) {
      return c.text('User not found', 404)
    }
    return c.json(userDetails)  // Return user details if found

  } catch (err) {
    console.error(err)
    return c.text('Invalid or expired token', 401)  // Unauthorized if token verification fails
  }
})

users.post('/', c => c.text('Create user')) // POST /user

export default users