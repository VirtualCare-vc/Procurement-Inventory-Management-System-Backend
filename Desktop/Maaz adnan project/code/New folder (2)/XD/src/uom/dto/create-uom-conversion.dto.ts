import { IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUomConversionDto {
  @IsString()
  fromUomId: string;

  @IsString()
  toUomId: string;

  @IsNumber({ maxDecimalPlaces: 4 })
  @Type(() => Number)
  @Min(0.0001)
  conversionRate: number;
}
