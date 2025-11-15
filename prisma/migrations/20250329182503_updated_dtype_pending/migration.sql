/*
  Warnings:

  - Changed the type of `pending` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "pending",
ADD COLUMN     "pending" DECIMAL(65,30) NOT NULL;
