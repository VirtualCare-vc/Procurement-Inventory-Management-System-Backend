import { Decimal } from '@prisma/client/runtime/library';

export class ItemResponseDto {
  id: string;
  companyId: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  uomId?: string;
  isService: boolean;
  
  // Pricing
  unitPrice?: Decimal;
  costPrice?: Decimal;
  currencyId?: string;
  
  // Tax
  taxRate?: Decimal;
  
  // Stock Management
  trackInventory: boolean;
  minStockLevel?: Decimal;
  maxStockLevel?: Decimal;
  reorderPoint?: Decimal;
  
  // Vendor Information
  preferredVendorId?: string;
  
  // Additional Info
  barcode?: string;
  manufacturer?: string;
  brand?: string;
  specifications?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Optional relations
  uom?: {
    id: string;
    name: string;
    code: string;
  };
  
  currency?: {
    id: string;
    code: string;
    name: string;
    symbol?: string;
  };
  
  preferredVendor?: {
    id: string;
    name: string;
    code: string;
  };
  
  company?: {
    id: string;
    name: string;
    code: string;
  };
}
