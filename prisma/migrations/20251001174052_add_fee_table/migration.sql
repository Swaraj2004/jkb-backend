-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "fee_id" UUID;

-- CreateTable
CREATE TABLE "Fee" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "student_fees" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_fees" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fee_year_student_id_key" ON "Fee"("year", "student_id");

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "StudentDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_fee_id_fkey" FOREIGN KEY ("fee_id") REFERENCES "Fee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
