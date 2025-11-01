-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('pending', 'approved');

-- AlterTable
ALTER TABLE "ClassStudent" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "status" "EnrollmentStatus" NOT NULL DEFAULT 'pending';
