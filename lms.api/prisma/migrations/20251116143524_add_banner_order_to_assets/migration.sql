-- AlterTable
ALTER TABLE "Assets" ADD COLUMN     "bannerOrder" INTEGER;

-- CreateIndex
CREATE INDEX "Assets_bannerClassId_bannerOrder_idx" ON "Assets"("bannerClassId", "bannerOrder");
