import { Hono } from 'hono'
import { PetSitterService } from '../../services/petsitterService'
import { Env } from '../../app'
import { PetSitterSchema, PetSitterUpdateSchema } from '../../schemas/petsitter'
import { ReviewSchema } from '../../schemas/review'
import { handleError, successResponse } from '../../utils/response'
import { Logger } from '../../utils/logger'
import { authMiddleware } from '../middleware/auth'
import { petSitterUpdateRateLimitMiddleware } from '../middleware/rateLimit'


const petsitters = new Hono<Env>()


// ---- PUBLIC ROUTES ----
petsitters.get('/', async (c) => {
  const petSitterService = new PetSitterService(c.get('prisma'))
  const pageRaw = Number(c.req.query('page') || '1')
  const limitRaw = Number(c.req.query('limit') || '9')
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 10
  const sort = c.req.query('sort')
  const petType = c.req.query('petType')
  const minPricePerHourRaw = Number(c.req.query('minPricePerHour'))
  const maxPricePerHourRaw = Number(c.req.query('maxPricePerHour'))
  const ratingMinRaw = Number(c.req.query('ratingMin'))
  const minPricePerHour = Number.isFinite(minPricePerHourRaw) ? minPricePerHourRaw : undefined
  const maxPricePerHour = Number.isFinite(maxPricePerHourRaw) ? maxPricePerHourRaw : undefined
  const ratingMin = Number.isFinite(ratingMinRaw) ? ratingMinRaw : undefined
  const name = c.req.query('name')
  const location = c.req.query('location')

  try {
    const petSitters = await petSitterService.list(page, limit, {
      sort,
      petType,
      minPricePerHour,
      maxPricePerHour,
      ratingMin,
      name,
      location,
    })

    return successResponse(c, petSitters)
  } catch (err) {
    return handleError(c, err, "Failed to list pet sitters")
  }
})

petsitters.get('/:id', async (c) => {
  const petSitterService = new PetSitterService(c.get('prisma'))
  const id = parseInt(c.req.param('id'))

 console.log("param:", c.req.param());

  try {
    const petSitter = await petSitterService.findById(id)
    return successResponse(c, petSitter)
  } catch (err) {
    return handleError(c, err, "Failed to fetch pet sitter")
  }
})

// Apply auth middleware to all routes
petsitters.use('*', authMiddleware)


// ---- PROTECTED ROUTES ----
petsitters.post('/', async (c) => {
  const petSitterService = new PetSitterService(c.get('prisma'))
  const body = await c.req.json()
  const userId = parseInt(c.get('userId'))

  const { success, data, error } = PetSitterSchema.safeParse(body)
  if (!success) {
    Logger.warn('Invalid pet sitter data', { errors: error.errors })
    return handleError(c, error, error.errors[0].message, 400)
  }

  try {
    const petSitter = await petSitterService.create(userId, data)
    return successResponse(c, petSitter, "Pet sitter profile created successfully")
  } catch (err) {
    return handleError(c, err, "Failed to create pet sitter profile")
  }
})





petsitters.put('/:id', petSitterUpdateRateLimitMiddleware, async (c) => {
  const petSitterService = new PetSitterService(c.get('prisma'))
  const body = await c.req.json()
  const id = parseInt(c.req.param('id'))
  const userId = parseInt(c.get('userId'))

  const { success, data, error } = PetSitterUpdateSchema.safeParse(body)
  if (!success) {
    Logger.warn('Invalid update data', { errors: error.errors })
    return handleError(c, error, error.errors[0].message, 400)
  }

  try {
    const updatedPetSitter = await petSitterService.update(id, userId, data)
    return successResponse(c, updatedPetSitter, "Pet sitter profile updated successfully")
  } catch (err) {
    return handleError(c, err, "Failed to update pet sitter profile")
  }
})

petsitters.delete('/:id', async (c) => {
  const petSitterService = new PetSitterService(c.get('prisma'))
  const id = parseInt(c.req.param('id'))
  const userId = parseInt(c.get('userId'))

  try {
    await petSitterService.delete(id, userId)
    return successResponse(c, null, "Pet sitter profile deleted successfully")
  } catch (err) {
    return handleError(c, err, "Failed to delete pet sitter profile")
  }
})

petsitters.post('/:id/availability', async (c) => {
  const petSitterService = new PetSitterService(c.get('prisma'))
  const body = await c.req.json()
  const id = parseInt(c.req.param('id'))
  const userId = parseInt(c.get('userId'))

  const { startDate, endDate } = body
  if (!startDate || !endDate) {
    return handleError(c, null, "Start date and end date are required", 400)
  }

  try {
    const availability = await petSitterService.addAvailability(
      id,
      userId,
      new Date(startDate),
      new Date(endDate)
    )
    return successResponse(c, availability, "Availability added successfully")
  } catch (err) {
    return handleError(c, err, "Failed to add availability")
  }
})

petsitters.post('/:id/reviews', async (c) => {
  const petSitterService = new PetSitterService(c.get('prisma'))
  const body = await c.req.json()
  const id = parseInt(c.req.param('id'))
  const authorId = parseInt(c.get('userId'))

  const { success, data, error } = ReviewSchema.safeParse(body)
  if (!success) {
    Logger.warn('Invalid review data', { errors: error.errors })
    return handleError(c, error, error.errors[0].message, 400)
  }

  try {
    const review = await petSitterService.createReview(id, authorId, data.rating, data.comment)
    return successResponse(c, review, "Review submitted successfully")
  } catch (err) {
    return handleError(c, err, "Failed to submit review")
  }
})

export default petsitters
