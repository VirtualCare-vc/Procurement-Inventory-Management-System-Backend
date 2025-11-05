export class PurchaseOrderLineResponseDto {
  id: string;
  lineNo: number;
  itemId?: string;
  itemCode?: string;
  itemName?: string;
  description: string;
  uomId?: string;
  uomCode?: string;
  uomName?: string;
  qty: number;
  price: number;
  taxRate?: number;
  lineSubTotal: number;
  lineTax: number;
  lineTotal: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PurchaseOrderResponseDto {
  id: string;
  companyId: string;
  companyName?: string;
  vendorId: string;
  vendorCode?: string;
  vendorName?: string;
  siteId?: string;
  siteName?: string;
  number: string;
  status: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  currencyId?: string;
  currencyCode?: string;
  currencySymbol?: string;
  exchangeRateId?: string;
  exchangeRate?: number;
  remarks?: string;
  paymentTerms?: string;
  shippingAddress?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  createdById?: string;
  updatedById?: string;
  createdAt: Date;
  updatedAt: Date;
  lines: PurchaseOrderLineResponseDto[];
}
