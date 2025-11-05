import { IsString, IsOptional, IsArray, ValidateNested, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePurchaseOrderLineDto } from './create-po-line.dto';

export class CreatePurchaseOrderDto {
  @IsString()
  companyId: string; // Company creating the PO

  @IsString()
  vendorId: string; // Vendor to order from

  @IsString()
  @IsOptional()
  siteId?: string; // Delivery site (optional)

  @IsString()
  @IsOptional()
  currencyId?: string; // Currency for the PO (optional - will use vendor's default or company's base currency)

  @IsDateString()
  @IsOptional()
  orderDate?: string; // Order date (optional - defaults to now)

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string; // Expected delivery date (optional)

  @IsString()
  @IsOptional()
  remarks?: string; // General remarks/notes

  @IsString()
  @IsOptional()
  paymentTerms?: string; // Payment terms (e.g., "Net 30")

  @IsString()
  @IsOptional()
  shippingAddress?: string; // Shipping address

  @IsString()
  @IsOptional()
  contactPerson?: string; // Contact person at vendor

  @IsString()
  @IsOptional()
  contactEmail?: string; // Contact email

  @IsString()
  @IsOptional()
  contactPhone?: string; // Contact phone

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderLineDto)
  lines: CreatePurchaseOrderLineDto[]; // PO line items (at least one required)
}
