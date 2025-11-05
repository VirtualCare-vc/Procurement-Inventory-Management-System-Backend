// src/vendor/dto/create-vendor.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, IsEmail } from 'class-validator';

export class CreateVendorDto {
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsOptional()
  currencyId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
