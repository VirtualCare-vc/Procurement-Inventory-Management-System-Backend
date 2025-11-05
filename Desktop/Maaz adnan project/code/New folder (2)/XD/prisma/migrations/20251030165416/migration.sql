-- CreateTable
CREATE TABLE "CompanyModel" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "RegistertrationAddress" TEXT NOT NULL,
    "TaxIdentificationNumber" TEXT NOT NULL,
    "additionalDetails" TEXT,
    "City" TEXT NOT NULL,
    "Country" TEXT NOT NULL,
    "Province" TEXT NOT NULL,
    "ZipCode" TEXT NOT NULL,
    "BaseCurrency" TEXT NOT NULL,
    "TimeZone" TEXT NOT NULL,
    "Description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyModel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompanyModel" ADD CONSTRAINT "CompanyModel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
