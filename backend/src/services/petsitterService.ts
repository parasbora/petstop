import { PrismaClient } from '@prisma/client'
import { Logger } from '../utils/logger'
import { AppError } from '../types'

export class PetSitterService {
  constructor(private prisma: PrismaClient) {}

  async create(userId: number, data: any) {
    try {
      // Check if user already has a pet sitter profile
      const existingPetSitter = await this.prisma.petSitter.findUnique({
        where: { userId }
      })

      if (existingPetSitter) {
        throw new AppError('User already has a pet sitter profile', 400)
      }

      const { availability, ...petSitterData } = data

      const petSitter = await this.prisma.petSitter.create({
        data: {
          ...petSitterData,
          userId,
          availability: {
            create: availability.map((avail: any) => ({
              startDate: new Date(avail.startDate),
              endDate: new Date(avail.endDate)
            }))
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          availability: true
        }
      })

      // Update user with petSitterId
      await this.prisma.user.update({
        where: { id: userId },
        data: { petSitterId: petSitter.id }
      })

      return petSitter
    } catch (error) {
      if (error instanceof AppError) throw error
      Logger.error('Failed to create pet sitter', error as Error)
      throw new AppError('Failed to create pet sitter', 500)
    }
  }

  async findById(id: number) {
    try {
      const petSitter = await this.prisma.petSitter.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          availability: true
        }
      })
      if (!petSitter) {
        throw new AppError('Pet sitter not found', 404)
      }
      return petSitter
    } catch (error) {
      if (error instanceof AppError) throw error
      Logger.error('Failed to find pet sitter', error as Error)
      throw new AppError('Failed to find pet sitter', 500)
    }
  }

  async update(id: number, userId: number, data: any) {
    try {
      const petSitter = await this.prisma.petSitter.findUnique({
        where: { id }
      })

      if (!petSitter) {
        throw new AppError('Pet sitter not found', 404)
      }

      if (petSitter.userId !== userId) {
        throw new AppError('Unauthorized', 403)
      }

      const updatedPetSitter = await this.prisma.petSitter.update({
        where: { id },
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          availability: true
        }
      })
      return updatedPetSitter
    } catch (error) {
      if (error instanceof AppError) throw error
      Logger.error('Failed to update pet sitter', error as Error)
      throw new AppError('Failed to update pet sitter', 500)
    }
  }

  async delete(id: number, userId: number) {
    try {
      const petSitter = await this.prisma.petSitter.findUnique({
        where: { id }
      })

      if (!petSitter) {
        throw new AppError('Pet sitter not found', 404)
      }

      if (petSitter.userId !== userId) {
        throw new AppError('Unauthorized', 403)
      }

      // Delete associated availability records
      await this.prisma.petSitterAvailability.deleteMany({
        where: { petSitterId: id }
      })

      // Delete pet sitter profile
      await this.prisma.petSitter.delete({
        where: { id }
      })

      // Update user to remove petSitterId
      await this.prisma.user.update({
        where: { id: userId },
        data: { petSitterId: null }
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      Logger.error('Failed to delete pet sitter', error as Error)
      throw new AppError('Failed to delete pet sitter', 500)
    }
  }

  async list(page: number = 1, limit: number = 10) {
    try {
      const petSitters = await this.prisma.petSitter.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          availability: true
        }
      })
      return petSitters
    } catch (error) {
      Logger.error('Failed to list pet sitters', error as Error)
      throw new AppError('Failed to list pet sitters', 500)
    }
  }

  async addAvailability(petSitterId: number, userId: number, startDate: Date, endDate: Date) {
    try {
      const petSitter = await this.prisma.petSitter.findUnique({
        where: { id: petSitterId }
      })

      if (!petSitter) {
        throw new AppError('Pet sitter not found', 404)
      }

      if (petSitter.userId !== userId) {
        throw new AppError('Unauthorized', 403)
      }

      const availability = await this.prisma.petSitterAvailability.create({
        data: {
          petSitterId,
          startDate,
          endDate
        }
      })
      return availability
    } catch (error) {
      if (error instanceof AppError) throw error
      Logger.error('Failed to add availability', error as Error)
      throw new AppError('Failed to add availability', 500)
    }
  }
} 