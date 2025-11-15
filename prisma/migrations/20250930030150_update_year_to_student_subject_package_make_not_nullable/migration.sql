/*
  Warnings:

  - Made the column `year` on table `StudentPackage` required. This step will fail if there are existing NULL values in that column.
  - Made the column `year` on table `StudentSubject` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "StudentPackage" ALTER COLUMN "year" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudentSubject" ALTER COLUMN "year" SET NOT NULL;
