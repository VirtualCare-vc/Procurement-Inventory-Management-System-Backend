import { IsString, IsOptional, IsNumber, IsPositive, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseOrderLineDto {
  @IsString()
  @IsOptional()
  itemId?: string; // Optional - can be a catalog item or free-text

  @IsString()
  description: string; // Item description (required)

  @IsString()
  @IsOptional()
  uomId?: string; // Unit of measure

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  qty: number; // Quantity (required)

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number; // Price per unit (optional - will be fetched from item if not provided)

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  taxRate?: number; // Tax rate percentage (optional - will be fetched from item if not provided)

  @IsString()
  @IsOptional()
  notes?: string; // Line-level notes
}
