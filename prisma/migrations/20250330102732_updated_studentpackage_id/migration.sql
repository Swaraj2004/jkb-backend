-- DropForeignKey
ALTER TABLE "StudentPackage" DROP CONSTRAINT "StudentPackage_student_id_fkey";

-- AddForeignKey
ALTER TABLE "StudentPackage" ADD CONSTRAINT "StudentPackage_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
