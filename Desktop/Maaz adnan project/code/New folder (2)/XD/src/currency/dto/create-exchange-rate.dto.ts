// src/currency/dto/create-exchange-rate.dto.ts
import { IsString, IsNotEmpty, IsUUID, IsNumber, IsDateString } from 'class-validator';

export class CreateExchangeRateDto {
  @IsUUID()
  @IsNotEmpty()
  baseCurrencyId: string;

  @IsUUID()
  @IsNotEmpty()
  targetCurrencyId: string;

  @IsNumber()
  @IsNotEmpty()
  rate: number; // Exchange rate value

  @IsDateString()
  @IsNotEmpty()
  effectiveDate: string; // Date when this rate becomes effective
}
