import { PrismaClient, BookingStatus } from '@prisma/client'
import { Logger } from '../utils/logger'
import { AppError } from '../types'

const SITTER_INCLUDE = {
  user: { select: { id: true, name: true } },
} as const

const OWNER_INCLUDE = {
  petSitter: {
    include: SITTER_INCLUDE,
  },
} as const

const REQUESTER_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
} as const

export class BookingService {
  constructor(private prisma: PrismaClient) {}

  async create(
    userId: number,
    data: { petSitterId: number; startDate: string; endDate: string; message?: string },
  ) {
    try {
      const petSitter = await this.prisma.petSitter.findUnique({
        where: { id: data.petSitterId },
      })

      if (!petSitter) {
        throw new AppError('Pet sitter not found', 404)
      }

      if (petSitter.userId === userId) {
        throw new AppError('You cannot book your own sitter profile', 400)
      }

      const booking = await this.prisma.booking.create({
        data: {
          userId,
          petSitterId: data.petSitterId,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          message: data.message,
        },
        include: OWNER_INCLUDE,
      })

      return booking
    } catch (error) {
      if (error instanceof AppError) throw error
      Logger.error('Failed to create booking', error as Error)
      throw new AppError('Failed to create booking', 500)
    }
  }

  // Bookings the user made as a pet owner
  async listForOwner(userId: number) {
    try {
      return await this.prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: OWNER_INCLUDE,
      })
    } catch (error) {
      Logger.error('Failed to list bookings for owner', error as Error)
      throw new AppError('Failed to list bookings', 500)
    }
  }

  // Booking requests made against the user's own sitter profile (if any)
  async listForSitter(userId: number) {
    try {
      const petSitter = await this.prisma.petSitter.findUnique({ where: { userId } })
      if (!petSitter) return []

      return await this.prisma.booking.findMany({
        where: { petSitterId: petSitter.id },
        orderBy: { createdAt: 'desc' },
        include: REQUESTER_INCLUDE,
      })
    } catch (error) {
      Logger.error('Failed to list bookings for sitter', error as Error)
      throw new AppError('Failed to list bookings', 500)
    }
  }

  async updateStatus(bookingId: number, userId: number, status: BookingStatus) {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { petSitter: true },
      })

      if (!booking) {
        throw new AppError('Booking not found', 404)
      }

      const isOwner = booking.userId === userId
      const isSitter = booking.petSitter.userId === userId

      if (!isOwner && !isSitter) {
        throw new AppError('Unauthorized', 403)
      }

      if (status === 'CANCELLED') {
        if (!isOwner) {
          throw new AppError('Only the pet owner can cancel a booking', 403)
        }
        if (booking.status !== 'PENDING' && booking.status !== 'ACCEPTED') {
          throw new AppError(`Cannot cancel a booking that is ${booking.status.toLowerCase()}`, 400)
        }
      } else if (status === 'ACCEPTED' || status === 'DECLINED') {
        if (!isSitter) {
          throw new AppError('Only the sitter can accept or decline a booking', 403)
        }
        if (booking.status !== 'PENDING') {
          throw new AppError(`Cannot ${status.toLowerCase()} a booking that is ${booking.status.toLowerCase()}`, 400)
        }
      } else if (status === 'COMPLETED') {
        if (!isSitter) {
          throw new AppError('Only the sitter can mark a booking as completed', 403)
        }
        if (booking.status !== 'ACCEPTED') {
          throw new AppError('Only accepted bookings can be marked as completed', 400)
        }
      }

      return await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status },
        include: OWNER_INCLUDE,
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      Logger.error('Failed to update booking status', error as Error)
      throw new AppError('Failed to update booking status', 500)
    }
  }
}
