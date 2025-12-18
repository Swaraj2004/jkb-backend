/*
  Warnings:

  - You are about to drop the column `created_by` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the column `subject_id` on the `Lecture` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_subject_id_fkey";

-- AlterTable
ALTER TABLE "Lecture" DROP COLUMN "created_by",
DROP COLUMN "subject_id";

-- CreateIndex
CREATE INDEX "Lecture_batch_id_idx" ON "Lecture"("batch_id");

-- CreateIndex
CREATE INDEX "Lecture_professor_id_idx" ON "Lecture"("professor_id");
