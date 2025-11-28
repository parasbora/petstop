import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

const bookings =  new Hono<Env>()

bookings.use('*', authMiddleware)

bookings.get('/', c => {


    return c.json({
        
    })
}) // GET /user

bookings.post('/', c => c.text('Create booking')) // POST /user

export default bookings