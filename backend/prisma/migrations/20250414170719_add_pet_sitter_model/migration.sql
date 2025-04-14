/*
  Warnings:

  - The `experience` column on the `PetSitter` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PetSitter" DROP COLUMN "experience",
ADD COLUMN     "experience" INTEGER;
