-- CreateEnum
CREATE TYPE "ProgrammingLanguage" AS ENUM ('cpp', 'python', 'java', 'javascript', 'typescript', 'go', 'rust');

-- AlterTable
ALTER TABLE "SavedProblem" ADD COLUMN     "betterNotes" TEXT,
ADD COLUMN     "bruteNotes" TEXT,
ADD COLUMN     "optimalNotes" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "preferredLanguage" "ProgrammingLanguage";
