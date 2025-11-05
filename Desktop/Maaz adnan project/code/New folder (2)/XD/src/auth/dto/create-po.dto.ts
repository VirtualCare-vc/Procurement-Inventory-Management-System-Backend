import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreatePOLineDto {
  @IsOptional() @IsString() itemId?: string; // allow free-text lines
  @IsString() description: string;
  @IsOptional() @IsString() uomId?: string;
  @IsNotEmpty() @IsNumberString() qty: string;   // send as string to keep precision
  @IsNotEmpty() @IsNumberString() price: string;
  @IsOptional() @IsNumberString() taxRate?: string; // percent e.g. 10.00
}

export class CreatePODto {
  @IsString() companyId: string;
  @IsString() vendorId: string;
  @IsOptional() @IsString() siteId?: string;
  @IsOptional() @IsDateString() orderDate?: string;
  @IsOptional() @IsString() currencyId?: string;
  @IsOptional() @IsString() exchangeRateId?: string;
  @IsOptional() @IsString() remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePOLineDto)
  lines: CreatePOLineDto[];
}
