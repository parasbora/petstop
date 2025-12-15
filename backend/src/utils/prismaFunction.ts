import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma: PrismaClient | null = null;
let prismaInstanceCount = 0;

export const getPrisma = (databaseUrl: string) => {
  if (!prisma) {
    prismaInstanceCount++;
    console.log("🔥 New PrismaClient created:", prismaInstanceCount);

    prisma = new PrismaClient({
      datasourceUrl: databaseUrl,
    }).$extends(withAccelerate());
  }

  return prisma;
};
