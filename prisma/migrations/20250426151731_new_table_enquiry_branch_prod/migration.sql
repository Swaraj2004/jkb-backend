-- AlterTable
ALTER TABLE "Qna" ALTER COLUMN "qna" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ContactEnquiry" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "location" TEXT,
    "contact" TEXT,
    "message" TEXT,

    CONSTRAINT "ContactEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchEnquiry" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "location" TEXT,
    "contact" TEXT,
    "branch_qna" JSONB,

    CONSTRAINT "BranchEnquiry_pkey" PRIMARY KEY ("id")
);
