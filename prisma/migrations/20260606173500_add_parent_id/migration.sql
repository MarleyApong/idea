-- AlterTable
ALTER TABLE "Idea" ADD COLUMN "parentId" TEXT;

-- AddForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Idea"("id") ON DELETE SET NULL ON UPDATE CASCADE;
