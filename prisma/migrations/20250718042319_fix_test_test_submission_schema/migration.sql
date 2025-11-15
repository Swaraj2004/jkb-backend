/*
  Warnings:

  - You are about to drop the column `test_toggle` on the `Test` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('Scheduled', 'InProgress', 'Completed');

-- AlterTable
ALTER TABLE "Test" DROP COLUMN "test_toggle",
ADD COLUMN     "test_status" "TestStatus" NOT NULL DEFAULT 'Scheduled';

-- AlterTable
ALTER TABLE "TestSubmission" ADD COLUMN     "score" DECIMAL(5,2) NOT NULL DEFAULT 0.00;
