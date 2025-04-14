-- AlterTable
ALTER TABLE "PetSitter" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "hourlyRate" DOUBLE PRECISION,
ADD COLUMN     "serviceTypes" TEXT[];
