/*
  Warnings:

  - You are about to drop the column `RegistertrationAddress` on the `CompanyModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CompanyModel" DROP COLUMN "RegistertrationAddress",
ADD COLUMN     "RegistrationAddress" TEXT;
