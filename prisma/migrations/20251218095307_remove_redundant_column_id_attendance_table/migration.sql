/*
  Warnings:

  - The primary key for the `Attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Attendance` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Attendance_lecture_id_student_id_key";

-- AlterTable
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY ("lecture_id", "student_id");
