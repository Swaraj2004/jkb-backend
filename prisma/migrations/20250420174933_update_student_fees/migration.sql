/*
  Warnings:

  - The primary key for the `MhAiCollege` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `professor_id` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `total_marks` on the `Test` table. All the data in the column will be lost.
  - You are about to drop the column `correct_option_id` on the `TestQuestion` table. All the data in the column will be lost.
  - Changed the type of `id` on the `MhAiCollege` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `is_correct` on table `QuestionOption` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `user_id` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_lecture_id_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_professor_id_fkey";

-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "PackageSubject" DROP CONSTRAINT "PackageSubject_package_id_fkey";

-- DropForeignKey
ALTER TABLE "PackageSubject" DROP CONSTRAINT "PackageSubject_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "QuestionOption" DROP CONSTRAINT "QuestionOption_question_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentDetail" DROP CONSTRAINT "StudentDetail_user_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentPackage" DROP CONSTRAINT "StudentPackage_package_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentPackage" DROP CONSTRAINT "StudentPackage_student_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentSubject" DROP CONSTRAINT "StudentSubject_student_id_fkey";

-- DropForeignKey
ALTER TABLE "StudentSubject" DROP CONSTRAINT "StudentSubject_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "SubjectProfessor" DROP CONSTRAINT "SubjectProfessor_professor_id_fkey";

-- DropForeignKey
ALTER TABLE "SubjectProfessor" DROP CONSTRAINT "SubjectProfessor_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "Test" DROP CONSTRAINT "Test_professor_id_fkey";

-- DropForeignKey
ALTER TABLE "Test" DROP CONSTRAINT "Test_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "TestQuestion" DROP CONSTRAINT "TestQuestion_correct_option_id_fkey";

-- DropForeignKey
ALTER TABLE "TestQuestion" DROP CONSTRAINT "TestQuestion_test_id_fkey";

-- DropForeignKey
ALTER TABLE "TestSubmission" DROP CONSTRAINT "TestSubmission_test_id_fkey";

-- DropForeignKey
ALTER TABLE "TestSubmission" DROP CONSTRAINT "TestSubmission_user_id_fkey";

-- DropForeignKey
ALTER TABLE "TestSubmissionAnswer" DROP CONSTRAINT "TestSubmissionAnswer_question_id_fkey";

-- DropForeignKey
ALTER TABLE "TestSubmissionAnswer" DROP CONSTRAINT "TestSubmissionAnswer_selected_option_id_fkey";

-- DropForeignKey
ALTER TABLE "TestSubmissionAnswer" DROP CONSTRAINT "TestSubmissionAnswer_test_submission_id_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_role_id_fkey";

-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_user_id_fkey";

-- DropIndex
DROP INDEX "TestQuestion_correct_option_id_key";

-- AlterTable
ALTER TABLE "MhAiCollege" DROP CONSTRAINT "MhAiCollege_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "MhAiCollege_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "QuestionOption" ALTER COLUMN "is_correct" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudentDetail" ADD COLUMN     "student_fees" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Test" DROP COLUMN "professor_id",
DROP COLUMN "total_marks",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "TestQuestion" DROP COLUMN "correct_option_id";

-- CreateTable
CREATE TABLE "Qna" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "location" TEXT,
    "contact" TEXT,
    "qna" JSONB NOT NULL,

    CONSTRAINT "Qna_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDetail" ADD CONSTRAINT "StudentDetail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "Lecture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectProfessor" ADD CONSTRAINT "SubjectProfessor_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectProfessor" ADD CONSTRAINT "SubjectProfessor_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageSubject" ADD CONSTRAINT "PackageSubject_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageSubject" ADD CONSTRAINT "PackageSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubject" ADD CONSTRAINT "StudentSubject_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSubject" ADD CONSTRAINT "StudentSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPackage" ADD CONSTRAINT "StudentPackage_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPackage" ADD CONSTRAINT "StudentPackage_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "TestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubmission" ADD CONSTRAINT "TestSubmission_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubmission" ADD CONSTRAINT "TestSubmission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubmissionAnswer" ADD CONSTRAINT "TestSubmissionAnswer_test_submission_id_fkey" FOREIGN KEY ("test_submission_id") REFERENCES "TestSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubmissionAnswer" ADD CONSTRAINT "TestSubmissionAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "TestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubmissionAnswer" ADD CONSTRAINT "TestSubmissionAnswer_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "QuestionOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
