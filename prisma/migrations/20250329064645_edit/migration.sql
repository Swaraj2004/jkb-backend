/*
  Warnings:

  - Added the required column `is_gst` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "is_gst" BOOLEAN NOT NULL;
