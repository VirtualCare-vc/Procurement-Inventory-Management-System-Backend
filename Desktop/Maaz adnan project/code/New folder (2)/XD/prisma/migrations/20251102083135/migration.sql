/*
  Warnings:

  - A unique constraint covering the columns `[companyId,code]` on the table `UoM` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `UoM` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UoM" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "UoM_companyId_isActive_idx" ON "UoM"("companyId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "UoM_companyId_code_key" ON "UoM"("companyId", "code");
