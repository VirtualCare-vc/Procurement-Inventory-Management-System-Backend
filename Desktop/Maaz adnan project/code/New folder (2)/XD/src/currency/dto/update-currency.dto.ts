// src/currency/dto/update-currency.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateCurrencyDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  symbol?: string;
}
