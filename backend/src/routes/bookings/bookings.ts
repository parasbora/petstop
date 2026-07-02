import { Hono } from 'hono'
import { BookingService } from '../../services/bookingService'
import { Env } from '../../app'
import { createBookingSchema, updateBookingStatusSchema } from '../../schemas/booking'
import { handleError, successResponse } from '../../utils/response'
import { Logger } from '../../utils/logger'
import { authMiddleware } from '../middleware/auth'

const bookings = new Hono<Env>()

bookings.use('*', authMiddleware)

// POST /bookings — request a booking with a sitter
bookings.post('/', async (c) => {
  const bookingService = new BookingService(c.get('prisma'))
  const userId = Number(c.get('userId'))
  const body = await c.req.json()

  const { success, data, error } = createBookingSchema.safeParse(body)
  if (!success) {
    Logger.warn('Invalid booking data', { errors: error.errors })
    return handleError(c, error, error.errors[0].message, 400)
  }

  try {
    const booking = await bookingService.create(userId, data)
    return successResponse(c, booking, 'Booking requested successfully')
  } catch (err) {
    return handleError(c, err, 'Failed to create booking')
  }
})

// GET /bookings/mine — bookings I made as a pet owner
bookings.get('/mine', async (c) => {
  const bookingService = new BookingService(c.get('prisma'))
  const userId = Number(c.get('userId'))

  try {
    const result = await bookingService.listForOwner(userId)
    return successResponse(c, result)
  } catch (err) {
    return handleError(c, err, 'Failed to fetch bookings')
  }
})

// GET /bookings/requests — booking requests against my sitter profile
bookings.get('/requests', async (c) => {
  const bookingService = new BookingService(c.get('prisma'))
  const userId = Number(c.get('userId'))

  try {
    const result = await bookingService.listForSitter(userId)
    return successResponse(c, result)
  } catch (err) {
    return handleError(c, err, 'Failed to fetch booking requests')
  }
})

// PUT /bookings/:id/status — accept / decline / cancel / complete a booking
bookings.put('/:id/status', async (c) => {
  const bookingService = new BookingService(c.get('prisma'))
  const userId = Number(c.get('userId'))
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const { success, data, error } = updateBookingStatusSchema.safeParse(body)
  if (!success) {
    Logger.warn('Invalid booking status update', { errors: error.errors })
    return handleError(c, error, error.errors[0].message, 400)
  }

  try {
    const booking = await bookingService.updateStatus(id, userId, data.status)
    return successResponse(c, booking, 'Booking updated successfully')
  } catch (err) {
    return handleError(c, err, 'Failed to update booking')
  }
})

export default bookings
