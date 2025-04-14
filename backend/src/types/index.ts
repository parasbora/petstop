import { Context } from 'hono'
import { PrismaClient } from '@prisma/client'

// Environment variables type
export type Env = {
  Bindings: {
    DATABASE_URL: string
    JWT_SECRET: string
  }
  Variables: {
    userId: string
    prisma: PrismaClient
  }
}

// Custom context type extending Hono's Context
export type CustomContext = Context<Env>

// API Response type
export type ApiResponse<T = any> = {
  data?: T
  error?: string
  message?: string
}

// User types
export type User = {
  id: number
  email: string
  name: string | null
  password: string
  petSitterId: number | null
  createdAt: Date
  updatedAt: Date
}

export type PublicUser = Omit<User, 'password'>

export type UserCreateInput = {
  email: string
  name?: string | null
  password: string
  petSitterId?: number | null
}

export type UserUpdateInput = Partial<Omit<UserCreateInput, 'password'>>

// Error types
export class AppError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message)
    this.name = 'AppError'
  }
}

export type ValidationError = {
  field: string
  message: string
}

export type AuthError = {
  code: 'INVALID_CREDENTIALS' | 'UNAUTHORIZED' | 'RATE_LIMITED'
  message: string
}

export type DatabaseError = {
  code: 'UNIQUE_CONSTRAINT' | 'FOREIGN_KEY' | 'NOT_FOUND'
  message: string
}

// Database operation types
export type DatabaseOperation<T> = {
  findById: (id: number) => Promise<T | null>
  create: (data: any) => Promise<T>
  update: (id: number, data: any) => Promise<T>
} 