/*
  Warnings:

  - You are about to drop the column `student_id` on the `Payment` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_student_id_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "student_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "StudentDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
