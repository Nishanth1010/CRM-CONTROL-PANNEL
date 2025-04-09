/*
  Warnings:

  - You are about to drop the column `date` on the `Followup` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Followup` table. All the data in the column will be lost.
  - Added the required column `lastRequirement` to the `Followup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextFollowupDate` to the `Followup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Followup" DROP COLUMN "date",
DROP COLUMN "notes",
ADD COLUMN     "lastRequirement" TEXT NOT NULL,
ADD COLUMN     "nextFollowupDate" TIMESTAMP(3) NOT NULL;
