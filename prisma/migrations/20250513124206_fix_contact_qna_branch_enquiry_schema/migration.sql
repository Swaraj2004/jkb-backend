/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `BranchEnquiry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contact]` on the table `BranchEnquiry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `ContactEnquiry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contact]` on the table `ContactEnquiry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Qna` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contact]` on the table `Qna` will be added. If there are existing duplicate values, this will fail.
  - Made the column `contact` on table `BranchEnquiry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contact` on table `ContactEnquiry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contact` on table `Qna` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BranchEnquiry" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "contact" SET NOT NULL;

-- AlterTable
ALTER TABLE "ContactEnquiry" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "contact" SET NOT NULL;

-- AlterTable
ALTER TABLE "Qna" ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "contact" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BranchEnquiry_email_key" ON "BranchEnquiry"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BranchEnquiry_contact_key" ON "BranchEnquiry"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "ContactEnquiry_email_key" ON "ContactEnquiry"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ContactEnquiry_contact_key" ON "ContactEnquiry"("contact");

-- CreateIndex
CREATE UNIQUE INDEX "Qna_email_key" ON "Qna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Qna_contact_key" ON "Qna"("contact");
