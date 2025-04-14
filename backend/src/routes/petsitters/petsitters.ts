import { Hono } from 'hono'
import { PetSitterService } from '../../services/petsitterService'
import { Env } from '../../app'
import { PetSitterSchema, PetSitterUpdateSchema } from '../../schemas/petsitter'
import { handleError, successResponse } from '../../utils/response'
import { Logger } from '../../utils/logger'
import { authMiddleware } from '../middleware/auth'

const petsitters = new Hono<Env>()

// Apply auth middleware to all routes
petsitters.use('*', authMiddleware)

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

petsitters.get('/', async (c) => {
  const petSitterService = new PetSitterService(c.get('prisma'))
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')

  try {
    const petSitters = await petSitterService.list(page, limit)
    return successResponse(c, petSitters)
  } catch (err) {
    return handleError(c, err, "Failed to list pet sitters")
  }
})

petsitters.get('/:id', async (c) => {
  const petSitterService = new PetSitterService(c.get('prisma'))
  const id = parseInt(c.req.param('id'))

  try {
    const petSitter = await petSitterService.findById(id)
    return successResponse(c, petSitter)
  } catch (err) {
    return handleError(c, err, "Failed to fetch pet sitter")
  }
})

petsitters.put('/:id', async (c) => {
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

export default petsitters 