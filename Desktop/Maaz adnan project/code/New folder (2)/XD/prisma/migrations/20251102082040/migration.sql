-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "barcode" TEXT,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "costPrice" DECIMAL(18,4),
ADD COLUMN     "currencyId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "manufacturer" TEXT,
ADD COLUMN     "maxStockLevel" DECIMAL(18,4),
ADD COLUMN     "minStockLevel" DECIMAL(18,4),
ADD COLUMN     "preferredVendorId" TEXT,
ADD COLUMN     "reorderPoint" DECIMAL(18,4),
ADD COLUMN     "specifications" TEXT,
ADD COLUMN     "trackInventory" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unitPrice" DECIMAL(18,4);

-- CreateIndex
CREATE INDEX "Item_companyId_category_idx" ON "Item"("companyId", "category");

-- CreateIndex
CREATE INDEX "Item_companyId_isActive_idx" ON "Item"("companyId", "isActive");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_preferredVendorId_fkey" FOREIGN KEY ("preferredVendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
