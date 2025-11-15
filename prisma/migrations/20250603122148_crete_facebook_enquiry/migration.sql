-- CreateTable
CREATE TABLE "FacebookEnquiry" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "location" TEXT,
    "contact" TEXT NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacebookEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FacebookEnquiry_email_key" ON "FacebookEnquiry"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FacebookEnquiry_contact_key" ON "FacebookEnquiry"("contact");
