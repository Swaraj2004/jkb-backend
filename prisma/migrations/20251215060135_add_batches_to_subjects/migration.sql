/*
  Warnings:

  - A unique constraint covering the columns `[lecture_id,student_id]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batch_id` to the `Lecture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lecture" ADD COLUMN     "batch_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "Batch" (
    "id" UUID NOT NULL,
    "subject_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchProfessor" (
    "batch_id" UUID NOT NULL,
    "professor_id" UUID NOT NULL,

    CONSTRAINT "BatchProfessor_pkey" PRIMARY KEY ("batch_id","professor_id")
);

-- CreateTable
CREATE TABLE "StudentBatch" (
    "student_id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentBatch_pkey" PRIMARY KEY ("student_id","batch_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_lecture_id_student_id_key" ON "Attendance"("lecture_id", "student_id");

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchProfessor" ADD CONSTRAINT "BatchProfessor_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchProfessor" ADD CONSTRAINT "BatchProfessor_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBatch" ADD CONSTRAINT "StudentBatch_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBatch" ADD CONSTRAINT "StudentBatch_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
