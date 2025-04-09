/*
  Warnings:

  - Made the column `cin` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gstin` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mobile` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Made the column `registerAddress` on table `Company` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `accessLevel` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('ALL_ACCESS', 'ADMIN', 'LEADS', 'FOLLOW_UPS');

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL DEFAULT 'ALL_ACCESS';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "licenseCount" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "cin" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "gstin" SET NOT NULL,
ALTER COLUMN "mobile" SET NOT NULL,
ALTER COLUMN "registerAddress" SET NOT NULL;

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "accessLevel" "AccessLevel" NOT NULL;

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "alternatePhone" VARCHAR(15),
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdatePassword" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpdatePassword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_email_key" ON "Enquiry"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UpdatePassword_email_key" ON "UpdatePassword"("email");
