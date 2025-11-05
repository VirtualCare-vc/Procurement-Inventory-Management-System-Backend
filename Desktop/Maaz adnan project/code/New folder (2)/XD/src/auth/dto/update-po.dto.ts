// import { PartialType } from '@nestjs/mapped-types';

import { PartialType } from '@nestjs/mapped-types';
import { CreatePODto, CreatePOLineDto } from './create-po.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePODto extends PartialType(CreatePODto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePOLineDto)
  lines?: CreatePOLineDto[];
}
