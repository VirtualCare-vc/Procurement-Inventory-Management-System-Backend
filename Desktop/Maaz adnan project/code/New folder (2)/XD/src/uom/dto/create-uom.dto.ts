import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateUomDto {
  @IsString()
  @MaxLength(20)
  code: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(20)
  symbol: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
