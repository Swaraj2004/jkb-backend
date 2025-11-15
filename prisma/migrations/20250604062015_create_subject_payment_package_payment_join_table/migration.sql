-- CreateTable
CREATE TABLE "SubjectPayment" (
    "subject_id" UUID NOT NULL,
    "payment_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectPayment_pkey" PRIMARY KEY ("subject_id","payment_id")
);

-- CreateTable
CREATE TABLE "PackagePayment" (
    "payment_id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackagePayment_pkey" PRIMARY KEY ("package_id","payment_id")
);

-- AddForeignKey
ALTER TABLE "SubjectPayment" ADD CONSTRAINT "SubjectPayment_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectPayment" ADD CONSTRAINT "SubjectPayment_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePayment" ADD CONSTRAINT "PackagePayment_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackagePayment" ADD CONSTRAINT "PackagePayment_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
