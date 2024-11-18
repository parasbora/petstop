/*
  Warnings:

  - Added the required column `updatedAt` to the `PetSitter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PetSitter" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PetSitterAvailability" (
    "id" SERIAL NOT NULL,
    "petSitterId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PetSitterAvailability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PetSitterAvailability" ADD CONSTRAINT "PetSitterAvailability_petSitterId_fkey" FOREIGN KEY ("petSitterId") REFERENCES "PetSitter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
