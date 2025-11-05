// src/vendor/vendor.controller.ts
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
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  /**
   * Create a new vendor
   * POST /vendors
   */
  @Post()
  async create(@Req() req: any, @Body() createVendorDto: CreateVendorDto) {
    return this.vendorService.create(req.user.userId, createVendorDto);
  }

  /**
   * Get all vendors with filtering and pagination
   * GET /vendors?companyId=xxx&search=xxx&isActive=true&page=1&limit=10
   */
  @Get()
  async findAll(@Req() req: any, @Query() query: QueryVendorDto) {
    return this.vendorService.findAll(req.user.userId, query);
  }

  /**
   * Get vendor by ID
   * GET /vendors/:id
   */
  @Get(':id')
  async findById(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.vendorService.findById(req.user.userId, id);
  }

  /**
   * Get vendor by company and code
   * GET /vendors/company/:companyId/code/:code
   */
  @Get('company/:companyId/code/:code')
  async findByCompanyAndCode(
    @Req() req: any,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('code') code: string,
  ) {
    return this.vendorService.findByCompanyAndCode(req.user.userId, companyId, code);
  }

  /**
   * Get vendors by company
   * GET /vendors/company/:companyId
   */
  @Get('company/:companyId')
  async getVendorsByCompany(
    @Req() req: any,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() query: QueryVendorDto,
  ) {
    return this.vendorService.getVendorsByCompany(req.user.userId, companyId, query);
  }

  /**
   * Get vendor statistics
   * GET /vendors/:id/stats
   */
  @Get(':id/stats')
  async getStats(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.vendorService.getStats(req.user.userId, id);
  }

  /**
   * Update vendor
   * PUT /vendors/:id
   */
  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVendorDto: UpdateVendorDto,
  ) {
    return this.vendorService.update(req.user.userId, id, updateVendorDto);
  }

  /**
   * Soft delete vendor (set isActive to false)
   * DELETE /vendors/:id/soft
   */
  @Delete(':id/soft')
  async softDelete(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.vendorService.softDelete(req.user.userId, id);
  }

  /**
   * Hard delete vendor (permanent deletion)
   * DELETE /vendors/:id/hard
   */
  @Delete(':id/hard')
  async hardDelete(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.vendorService.hardDelete(req.user.userId, id);
  }
}
