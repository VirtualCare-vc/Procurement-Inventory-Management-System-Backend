// src/currency/dto/create-currency.dto.ts
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateCurrencyDto {
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  code: string; // e.g., 'USD', 'EUR', 'GBP'

  @IsString()
  @IsNotEmpty()
  name: string; // e.g., 'US Dollar', 'Euro', 'British Pound'

  @IsString()
  @IsOptional()
  symbol?: string; // e.g., '$', '€', '£'
}
