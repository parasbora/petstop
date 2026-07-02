import { PrismaClient } from '@prisma/client'
import { Logger } from '../utils/logger'
import { AppError } from '../types'

type PetInput = {
  name: string
  species: 'dog' | 'cat'
  breed: string
  age: number
}

export class PetService {
  constructor(private prisma: PrismaClient) {}

  async create(ownerId: number, data: PetInput) {
    try {
      return await this.prisma.pet.create({
        data: { ...data, ownerId },
      })
    } catch (error) {
      Logger.error('Failed to create pet', error as Error)
      throw new AppError('Failed to create pet', 500)
    }
  }

  async listForOwner(ownerId: number) {
    try {
      return await this.prisma.pet.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' },
      })
    } catch (error) {
      Logger.error('Failed to list pets', error as Error)
      throw new AppError('Failed to list pets', 500)
    }
  }

  async update(id: number, ownerId: number, data: Partial<PetInput>) {
    try {
      const pet = await this.prisma.pet.findUnique({ where: { id } })
      if (!pet) throw new AppError('Pet not found', 404)
      if (pet.ownerId !== ownerId) throw new AppError('Unauthorized', 403)

      return await this.prisma.pet.update({ where: { id }, data })
    } catch (error) {
      if (error instanceof AppError) throw error
      Logger.error('Failed to update pet', error as Error)
      throw new AppError('Failed to update pet', 500)
    }
  }

  async delete(id: number, ownerId: number) {
    try {
      const pet = await this.prisma.pet.findUnique({ where: { id } })
      if (!pet) throw new AppError('Pet not found', 404)
      if (pet.ownerId !== ownerId) throw new AppError('Unauthorized', 403)

      await this.prisma.pet.delete({ where: { id } })
    } catch (error) {
      if (error instanceof AppError) throw error
      Logger.error('Failed to delete pet', error as Error)
      throw new AppError('Failed to delete pet', 500)
    }
  }
}
