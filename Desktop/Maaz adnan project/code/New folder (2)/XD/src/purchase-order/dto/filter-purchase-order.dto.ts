import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum POStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_APPROVAL = 'UNDER_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ISSUED = 'ISSUED',
  CANCELLED = 'CANCELLED',
}

export class FilterPurchaseOrderDto {
  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsEnum(POStatus)
  @IsOptional()
  status?: POStatus;

  @IsString()
  @IsOptional()
  search?: string; // Search by PO number or remarks

  @IsDateString()
  @IsOptional()
  startDate?: string; // Filter by order date range

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  sortBy?: string; // Sort field (default: orderDate)

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc'; // Sort order (default: desc)
}
