-- AlterTable
ALTER TABLE "PackagePayment" ADD COLUMN     "fee_id" UUID;

-- AlterTable
ALTER TABLE "SubjectPayment" ADD COLUMN     "fee_id" UUID;

-- AddForeignKey
ALTER TABLE "SubjectPayment" ADD CONSTRAINT "SubjectPayment_fee_id_fkey" FOREIGN KEY ("fee_id") REFERENCES "Fee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePayment" ADD CONSTRAINT "PackagePayment_fee_id_fkey" FOREIGN KEY ("fee_id") REFERENCES "Fee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
