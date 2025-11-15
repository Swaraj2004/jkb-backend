-- DropForeignKey
ALTER TABLE "Fee" DROP CONSTRAINT "Fee_student_id_fkey";

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;
