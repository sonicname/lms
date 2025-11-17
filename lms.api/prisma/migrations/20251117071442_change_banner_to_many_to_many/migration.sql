/*
  Warnings:

  - You are about to drop the column `bannerClassId` on the `Assets` table. All the data in the column will be lost.
  - You are about to drop the column `bannerOrder` on the `Assets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Assets" DROP CONSTRAINT "Assets_bannerClassId_fkey";

-- DropIndex
DROP INDEX "public"."Assets_bannerClassId_bannerOrder_idx";

-- AlterTable
ALTER TABLE "Assets" DROP COLUMN "bannerClassId",
DROP COLUMN "bannerOrder";

-- CreateTable
CREATE TABLE "_ClassBanners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassBanners_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ClassBanners_B_index" ON "_ClassBanners"("B");

-- AddForeignKey
ALTER TABLE "_ClassBanners" ADD CONSTRAINT "_ClassBanners_A_fkey" FOREIGN KEY ("A") REFERENCES "Assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassBanners" ADD CONSTRAINT "_ClassBanners_B_fkey" FOREIGN KEY ("B") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
