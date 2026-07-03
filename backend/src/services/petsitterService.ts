import { PrismaClient } from '@prisma/client'
import { Logger } from '../utils/logger'
import { AppError } from '../types'

type ListOptions = {
  sort?: string
  petType?: string
  minPricePerHour?: number
  maxPricePerHour?: number
  ratingMin?: number
  name?: string
  location?: string
}

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
            // availability is optional in the schema; default to none
            create: (availability ?? []).map((avail: any) => ({
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
          // Public endpoint: do not expose the sitter's email
          user: {
            select: {
              id: true,
              name: true
            }
          },
          availability: true,
          reviews: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              author: { select: { id: true, name: true } }
            }
          }
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

  async list(page: number = 1, limit: number = 9, options: ListOptions = {}) {
    try {
      const where: any = {}

      if (typeof options.minPricePerHour === 'number' || typeof options.maxPricePerHour === 'number') {
        where.hourlyRate = {}
        if (typeof options.minPricePerHour === 'number') {
          where.hourlyRate.gte = options.minPricePerHour
        }
        if (typeof options.maxPricePerHour === 'number') {
          where.hourlyRate.lte = options.maxPricePerHour
        }
      }

      if (options.name) {
        where.OR = [
          { name: { contains: options.name, mode: 'insensitive' } },
          { bio: { contains: options.name, mode: 'insensitive' } }
        ]
      }

      if (options.location) {
        where.location = { contains: options.location, mode: 'insensitive' }
      }

      if (typeof options.ratingMin === 'number') {
        where.rating = { gte: options.ratingMin }
      }

      // petType: "cat" | "dog" filter to sitters accepting that animal;
      // "both" requires the sitter to accept both cats and dogs.
      if (options.petType === 'both') {
        where.petTypes = { hasEvery: ['cat', 'dog'] }
      } else if (options.petType && options.petType !== 'any') {
        where.petTypes = { has: options.petType }
      }

      let orderBy: any = { createdAt: 'desc' }
      if (options.sort === 'price_asc') orderBy = { hourlyRate: 'asc' }
      if (options.sort === 'price_desc') orderBy = { hourlyRate: 'desc' }
      if (options.sort === 'rating_desc') orderBy = { rating: 'desc' }

      const petSitters = await this.prisma.petSitter.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where,
        orderBy,
        include: {
          // Public listing: do not expose sitter emails
          user: {
            select: {
              id: true,
              name: true
            }
          },
          availability: true
        }
      })

      const total = await this.prisma.petSitter.count({ where })
   
      return { items: petSitters, total, page, limit }
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

  async createReview(petSitterId: number, authorId: number, rating: number, comment?: string) {
    try {
      const petSitter = await this.prisma.petSitter.findUnique({
        where: { id: petSitterId }
      })

      if (!petSitter) {
        throw new AppError('Pet sitter not found', 404)
      }

      if (petSitter.userId === authorId) {
        throw new AppError('You cannot review your own profile', 400)
      }

      // Upsert the review (one per user per sitter), then recompute the
      // denormalized rating/reviewCount from the source reviews atomically.
      const [review] = await this.prisma.$transaction([
        this.prisma.review.upsert({
          where: { petSitterId_authorId: { petSitterId, authorId } },
          create: { petSitterId, authorId, rating, comment },
          update: { rating, comment }
        })
      ])

      const agg = await this.prisma.review.aggregate({
        where: { petSitterId },
        _avg: { rating: true },
        _count: { rating: true }
      })

      await this.prisma.petSitter.update({
        where: { id: petSitterId },
        data: {
          rating: agg._avg.rating ?? 0,
          reviewCount: agg._count.rating
        }
      })

      return review
    } catch (error) {
      if (error instanceof AppError) throw error
      Logger.error('Failed to create review', error as Error)
      throw new AppError('Failed to create review', 500)
    }
  }
} 
