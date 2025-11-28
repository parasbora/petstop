import { Hono } from 'hono'



const bookings = new Hono<Env>()


bookings.get('/', c => c.text('petstop bookings:')) // GET /user

bookings.post('/', c => c.text('Create user')) // POST /user

export default bookings