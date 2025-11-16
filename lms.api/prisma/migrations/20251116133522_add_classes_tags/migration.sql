-- CreateTable
CREATE TABLE "ClassTags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassTags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ClassToClassTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClassToClassTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassTags_userId_name_key" ON "ClassTags"("userId", "name");

-- CreateIndex
CREATE INDEX "_ClassToClassTags_B_index" ON "_ClassToClassTags"("B");

-- AddForeignKey
ALTER TABLE "ClassTags" ADD CONSTRAINT "ClassTags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToClassTags" ADD CONSTRAINT "_ClassToClassTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassToClassTags" ADD CONSTRAINT "_ClassToClassTags_B_fkey" FOREIGN KEY ("B") REFERENCES "ClassTags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
