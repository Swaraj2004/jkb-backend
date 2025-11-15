/*
  Warnings:

  - The primary key for the `StudentPackage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `StudentSubject` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "StudentPackage" DROP CONSTRAINT "StudentPackage_pkey",
ADD CONSTRAINT "StudentPackage_pkey" PRIMARY KEY ("student_id", "package_id", "year");

-- AlterTable
ALTER TABLE "StudentSubject" DROP CONSTRAINT "StudentSubject_pkey",
ADD CONSTRAINT "StudentSubject_pkey" PRIMARY KEY ("student_id", "subject_id", "year");
