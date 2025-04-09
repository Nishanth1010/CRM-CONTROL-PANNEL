/*
  Warnings:

  - Added the required column `companyName` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextFollowupDate` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "nextFollowupDate" TIMESTAMP(3) NOT NULL;
