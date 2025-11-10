/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `Choice` table. All the data in the column will be lost.
  - You are about to drop the column `quizzId` on the `Choice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[correctChoiceId]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `quizId` to the `Choice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Choice" DROP CONSTRAINT "Choice_quizzId_fkey";

-- AlterTable
ALTER TABLE "Choice" DROP COLUMN "isCorrect",
DROP COLUMN "quizzId",
ADD COLUMN     "quizId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "correctChoiceId" TEXT;

-- CreateTable
CREATE TABLE "TestQuiz" (
    "testId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "points" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestQuiz_pkey" PRIMARY KEY ("testId","quizId")
);

-- CreateIndex
CREATE INDEX "TestQuiz_quizId_idx" ON "TestQuiz"("quizId");

-- CreateIndex
CREATE INDEX "Choice_quizId_idx" ON "Choice"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_correctChoiceId_key" ON "Quiz"("correctChoiceId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_correctChoiceId_fkey" FOREIGN KEY ("correctChoiceId") REFERENCES "Choice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Choice" ADD CONSTRAINT "Choice_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuiz" ADD CONSTRAINT "TestQuiz_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuiz" ADD CONSTRAINT "TestQuiz_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
