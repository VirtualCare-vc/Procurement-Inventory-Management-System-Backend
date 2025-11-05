import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UomService } from '../services/uom.service';
import { CreateUomDto } from '../dto/create-uom.dto';
import { UpdateUomDto } from '../dto/update-uom.dto';
import { CreateUomConversionDto } from '../dto/create-uom-conversion.dto';
import { FilterUomDto } from '../dto/filter-uom.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('uoms')
@UseGuards(JwtAuthGuard)
export class UomController {
  constructor(private readonly uomService: UomService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body('companyId') companyId: string,
    @Body() createUomDto: CreateUomDto,
  ) {
    return this.uomService.create(companyId, createUomDto);
  }

  @Get()
  async findAll(@Query() filters: FilterUomDto) {
    return this.uomService.findAll(filters);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.uomService.findById(id);
  }

  @Get('code/:companyId/:code')
  async findByCode(
    @Param('companyId') companyId: string,
    @Param('code') code: string,
  ) {
    return this.uomService.findByCode(companyId, code);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string) {
    return this.uomService.findByCompany(companyId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUomDto: UpdateUomDto) {
    return this.uomService.update(id, updateUomDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.uomService.delete(id);
  }

  @Delete(':id/soft')
  async softDelete(@Param('id') id: string) {
    return this.uomService.softDelete(id);
  }

  // UOM Conversion endpoints
  @Post('conversions')
  @HttpCode(HttpStatus.CREATED)
  async createConversion(@Body() createConversionDto: CreateUomConversionDto) {
    return this.uomService.createConversion(createConversionDto);
  }

  @Get('conversions/all')
  async findAllConversions() {
    return this.uomService.findAllConversions();
  }

  @Get('conversions/:fromUomId/:toUomId')
  async findConversion(
    @Param('fromUomId') fromUomId: string,
    @Param('toUomId') toUomId: string,
  ) {
    return this.uomService.findConversion(fromUomId, toUomId);
  }

  @Get(':id/conversions')
  async findConversionsByUom(@Param('id') id: string) {
    return this.uomService.findConversionsByUom(id);
  }

  @Put('conversions/:id')
  async updateConversion(
    @Param('id') id: string,
    @Body('conversionRate') conversionRate: number,
  ) {
    return this.uomService.updateConversion(id, conversionRate);
  }

  @Delete('conversions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConversion(@Param('id') id: string) {
    await this.uomService.deleteConversion(id);
  }

  @Post('convert')
  async convertQuantity(
    @Body('fromUomId') fromUomId: string,
    @Body('toUomId') toUomId: string,
    @Body('quantity') quantity: number,
  ) {
    const convertedQuantity = await this.uomService.convertQuantity(
      fromUomId,
      toUomId,
      quantity,
    );
    return {
      fromUomId,
      toUomId,
      originalQuantity: quantity,
      convertedQuantity,
    };
  }
}
