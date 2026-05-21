-- CreateEnum
CREATE TYPE "IdeaType" AS ENUM ('PROJET', 'INSPIRATION', 'RAPPEL', 'AUTRE');

-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "type" "IdeaType" NOT NULL DEFAULT 'PROJET';
