// prisma.service.ts
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export const prisma = new PrismaClient().$extends(withAccelerate());

/**
 * Checks if the email already exists in the database.
 * @param email User's email
 * @returns Boolean indicating if the email exists
 */
export async function isEmailTaken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });
  return user !== null;
}

/**
 * Creates a new user in the database.
 * @param email User's email
 * @param name User's name
 * @param password User's password (hashed)
 * @returns The newly created user
 */
export async function createUser(email: string, name: string, password: string) {
  return prisma.user.create({
    data: {
      email,
      name,
      password,
    }
  });
}

/**
 * Finds a user by their ID.
 * @param userId The ID of the user to fetch
 * @returns The user record or null
 */
export async function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}

/**
 * Finds a user by email.
 * @param email User's email
 * @returns The user record or null
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}
