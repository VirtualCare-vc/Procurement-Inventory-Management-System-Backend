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
import { ItemService } from '../services/item.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { FilterItemDto } from '../dto/filter-item.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body('companyId') companyId: string,
    @Body() createItemDto: CreateItemDto,
  ) {
    return this.itemService.create(companyId, createItemDto);
  }

  @Get()
  async findAll(@Query() filters: FilterItemDto) {
    return this.itemService.findAll(filters);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.itemService.findById(id);
  }

  @Get('code/:companyId/:code')
  async findByCode(
    @Param('companyId') companyId: string,
    @Param('code') code: string,
  ) {
    return this.itemService.findByCode(companyId, code);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId') companyId: string) {
    return this.itemService.findByCompany(companyId);
  }

  @Get('company/:companyId/category/:category')
  async findByCategory(
    @Param('companyId') companyId: string,
    @Param('category') category: string,
  ) {
    return this.itemService.findByCategory(companyId, category);
  }

  @Get('company/:companyId/low-stock')
  async getLowStockItems(@Param('companyId') companyId: string) {
    return this.itemService.getLowStockItems(companyId);
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: string) {
    return this.itemService.getStatistics(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemService.update(id, updateItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.itemService.delete(id);
  }

  @Delete(':id/soft')
  async softDelete(@Param('id') id: string) {
    return this.itemService.softDelete(id);
  }
}
