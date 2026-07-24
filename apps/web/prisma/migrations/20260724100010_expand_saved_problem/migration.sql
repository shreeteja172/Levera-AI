/*
  Warnings:

  - Added the required column `language` to the `SavedProblem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SavedProblem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SavedProblem" ADD COLUMN     "better" JSONB,
ADD COLUMN     "brute" JSONB,
ADD COLUMN     "language" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "optimal" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
