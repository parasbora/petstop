import { PrismaClient } from '@prisma/client'
import { User, PublicUser, UserCreateInput, UserUpdateInput } from '../types'
import bcrypt from 'bcryptjs'
import { Logger } from '../utils/logger'

export class UserService {
  constructor(private prisma: PrismaClient) {}

  private validatePassword(password: string): { isValid: boolean; error?: string } {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password)

    if (password.length < minLength) {
      return { isValid: false, error: `Password must be at least ${minLength} characters long` }
    }
    if (!hasUpperCase) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' }
    }
    if (!hasLowerCase) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' }
    }
    if (!hasNumbers) {
      return { isValid: false, error: 'Password must contain at least one number' }
    }
    if (!hasSpecialChar) {
      return { isValid: false, error: 'Password must contain at least one special character' }
    }

    return { isValid: true }
  }

  private validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' }
    }
    return { isValid: true }
  }

  async findById(id: number): Promise<PublicUser | null> {
    Logger.debug('Finding user by ID', { userId: id })
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          petSitterId: true,
          createdAt: true,
          updatedAt: true
        }
      })
      if (!user) {
        Logger.warn('User not found', { userId: id })
      }
      return user
    } catch (error) {
      Logger.error('Error finding user by ID', error as Error, { userId: id })
      throw error
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    Logger.debug('Finding user by email', { email })
    try {
      const emailValidation = this.validateEmail(email)
      if (!emailValidation.isValid) {
        Logger.warn('Invalid email format', { email })
        throw new Error(emailValidation.error)
      }
      const user = await this.prisma.user.findUnique({
        where: { email }
      })
      if (!user) {
        Logger.debug('User not found by email', { email })
      }
      return user
    } catch (error) {
      Logger.error('Error finding user by email', error as Error, { email })
      throw error
    }
  }

  async create(data: UserCreateInput): Promise<PublicUser> {
    Logger.info('Creating new user', { email: data.email })
    try {
      const emailValidation = this.validateEmail(data.email)
      if (!emailValidation.isValid) {
        Logger.warn('Invalid email format during user creation', { email: data.email })
        throw new Error(emailValidation.error)
      }

      const passwordValidation = this.validatePassword(data.password)
      if (!passwordValidation.isValid) {
        Logger.warn('Invalid password during user creation', { email: data.email })
        throw new Error(passwordValidation.error)
      }

      const hashedPassword = await bcrypt.hash(data.password, 10)
      const user = await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword
        }
      })
      const { password, ...publicUser } = user
      Logger.info('User created successfully', { userId: user.id, email: user.email })
      return publicUser
    } catch (error) {
      Logger.error('Error creating user', error as Error, { email: data.email })
      throw error
    }
  }

  async update(id: number, data: UserUpdateInput): Promise<PublicUser> {
    Logger.info('Updating user', { userId: id })
    try {
      if (data.email) {
        const emailValidation = this.validateEmail(data.email)
        if (!emailValidation.isValid) {
          Logger.warn('Invalid email format during user update', { userId: id, email: data.email })
          throw new Error(emailValidation.error)
        }
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          petSitterId: true,
          createdAt: true,
          updatedAt: true
        }
      })
      Logger.info('User updated successfully', { userId: id })
      return updatedUser
    } catch (error) {
      Logger.error('Error updating user', error as Error, { userId: id })
      throw error
    }
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    Logger.debug('Verifying password', { userId: user.id })
    try {
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        Logger.warn('Invalid password attempt', { userId: user.id })
      }
      return isValid
    } catch (error) {
      Logger.error('Error verifying password', error as Error, { userId: user.id })
      throw error
    }
  }
} 