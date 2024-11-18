
import { Hono } from "hono"

const app = new Hono()

app.use('*', async (c, next) => {
    await next()
    c.header('x-custom-message', 'This is middleware!')
  })