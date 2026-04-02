-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Lecture" ADD COLUMN     "total_count" INTEGER NOT NULL DEFAULT 0;
