import { Hono } from 'hono'
import { PetService } from '../../services/petService'
import { Env } from '../../app'
import { petSchema, petUpdateSchema } from '../../schemas/pet'
import { handleError, successResponse } from '../../utils/response'
import { Logger } from '../../utils/logger'
import { authMiddleware } from '../middleware/auth'

const pets = new Hono<Env>()

pets.use('*', authMiddleware)

// GET /pets — list my pets
pets.get('/', async (c) => {
  const petService = new PetService(c.get('prisma'))
  const ownerId = Number(c.get('userId'))

  try {
    const result = await petService.listForOwner(ownerId)
    return successResponse(c, result)
  } catch (err) {
    return handleError(c, err, 'Failed to fetch pets')
  }
})

// POST /pets — add a pet
pets.post('/', async (c) => {
  const petService = new PetService(c.get('prisma'))
  const ownerId = Number(c.get('userId'))
  const body = await c.req.json()

  const { success, data, error } = petSchema.safeParse(body)
  if (!success) {
    Logger.warn('Invalid pet data', { errors: error.errors })
    return handleError(c, error, error.errors[0].message, 400)
  }

  try {
    const pet = await petService.create(ownerId, data)
    return successResponse(c, pet, 'Pet added successfully')
  } catch (err) {
    return handleError(c, err, 'Failed to add pet')
  }
})

// PUT /pets/:id — update a pet
pets.put('/:id', async (c) => {
  const petService = new PetService(c.get('prisma'))
  const ownerId = Number(c.get('userId'))
  const id = parseInt(c.req.param('id'))
  const body = await c.req.json()

  const { success, data, error } = petUpdateSchema.safeParse(body)
  if (!success) {
    Logger.warn('Invalid pet update data', { errors: error.errors })
    return handleError(c, error, error.errors[0].message, 400)
  }

  try {
    const pet = await petService.update(id, ownerId, data)
    return successResponse(c, pet, 'Pet updated successfully')
  } catch (err) {
    return handleError(c, err, 'Failed to update pet')
  }
})

// DELETE /pets/:id — remove a pet
pets.delete('/:id', async (c) => {
  const petService = new PetService(c.get('prisma'))
  const ownerId = Number(c.get('userId'))
  const id = parseInt(c.req.param('id'))

  try {
    await petService.delete(id, ownerId)
    return successResponse(c, null, 'Pet removed successfully')
  } catch (err) {
    return handleError(c, err, 'Failed to remove pet')
  }
})

export default pets
