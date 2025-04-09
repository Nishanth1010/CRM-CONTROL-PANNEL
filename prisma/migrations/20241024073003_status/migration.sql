/*
  Warnings:

  - Changed the type of `status` on the `Lead` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CUSTOMER', 'REJECTED');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "cin" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "registerAddress" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "description" TEXT,
ADD COLUMN     "designation" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "LeadStatus" NOT NULL;
