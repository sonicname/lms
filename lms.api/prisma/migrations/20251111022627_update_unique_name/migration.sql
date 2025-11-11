/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `AssetsTag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `AssetsTag` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."AssetsTag_name_key";

-- AlterTable
ALTER TABLE "AssetsTag" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AssetsTag_userId_name_key" ON "AssetsTag"("userId", "name");

-- AddForeignKey
ALTER TABLE "AssetsTag" ADD CONSTRAINT "AssetsTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
