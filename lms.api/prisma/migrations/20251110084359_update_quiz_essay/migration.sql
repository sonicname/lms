-- CreateEnum
CREATE TYPE "TestType" AS ENUM ('essay', 'mcq');

-- AlterTable
ALTER TABLE "Assets" ADD COLUMN     "essayQuestionId" TEXT;

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "type" "TestType" NOT NULL DEFAULT 'mcq';

-- CreateTable
CREATE TABLE "EssayQuestion" (
    "id" TEXT NOT NULL,
    "prompt" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "testId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EssayQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmissionAnswer" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "choiceId" TEXT,
    "isCorrect" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubmissionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EssayQuestion_testId_idx" ON "EssayQuestion"("testId");

-- CreateIndex
CREATE INDEX "SubmissionAnswer_quizId_idx" ON "SubmissionAnswer"("quizId");

-- CreateIndex
CREATE INDEX "SubmissionAnswer_choiceId_idx" ON "SubmissionAnswer"("choiceId");

-- CreateIndex
CREATE UNIQUE INDEX "SubmissionAnswer_submissionId_quizId_key" ON "SubmissionAnswer"("submissionId", "quizId");

-- AddForeignKey
ALTER TABLE "Assets" ADD CONSTRAINT "Assets_essayQuestionId_fkey" FOREIGN KEY ("essayQuestionId") REFERENCES "EssayQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayQuestion" ADD CONSTRAINT "EssayQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAnswer" ADD CONSTRAINT "SubmissionAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAnswer" ADD CONSTRAINT "SubmissionAnswer_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmissionAnswer" ADD CONSTRAINT "SubmissionAnswer_choiceId_fkey" FOREIGN KEY ("choiceId") REFERENCES "Choice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
