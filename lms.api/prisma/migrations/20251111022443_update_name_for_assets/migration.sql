-- AlterTable
ALTER TABLE "Assets" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Assets_userId_lessonId_testId_submissionId_quizId_essayQues_idx" ON "Assets"("userId", "lessonId", "testId", "submissionId", "quizId", "essayQuestionId");

-- CreateIndex
CREATE INDEX "Assets_filename_url_idx" ON "Assets"("filename", "url");

-- CreateIndex
CREATE INDEX "Assets_name_idx" ON "Assets"("name");
