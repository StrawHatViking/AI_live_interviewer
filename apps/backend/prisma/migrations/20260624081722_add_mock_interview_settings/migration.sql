-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('Easy', 'Medium', 'Hard');

-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'Medium',
ADD COLUMN     "durationMins" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "isMock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "jobRole" TEXT;
