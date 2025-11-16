-- AlterTable
ALTER TABLE "Assets" ADD COLUMN     "bannerClassId" TEXT;

-- AddForeignKey
ALTER TABLE "Assets" ADD CONSTRAINT "Assets_bannerClassId_fkey" FOREIGN KEY ("bannerClassId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
