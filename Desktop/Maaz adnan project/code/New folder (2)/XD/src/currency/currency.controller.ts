// src/currency/currency.controller.ts
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
import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { QueryCurrencyDto } from './dto/query-currency.dto';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('currencies')
@UseGuards(JwtAuthGuard)
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  /**
   * Create a new currency
   * POST /currencies
   */
  @Post()
  async create(@Req() req: any, @Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currencyService.create(req.user.userId, createCurrencyDto);
  }

  /**
   * Get all currencies with filtering and pagination
   * GET /currencies?companyId=xxx&search=xxx&page=1&limit=50
   */
  @Get()
  async findAll(@Req() req: any, @Query() query: QueryCurrencyDto) {
    return this.currencyService.findAll(req.user.userId, query);
  }

  /**
   * Get currency by ID
   * GET /currencies/:id
   */
  @Get(':id')
  async findById(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.currencyService.findById(req.user.userId, id);
  }

  /**
   * Get currency by code
   * GET /currencies/code/:code
   */
  @Get('code/:code')
  async findByCode(@Req() req: any, @Param('code') code: string) {
    return this.currencyService.findByCode(req.user.userId, code);
  }

  /**
   * Get currencies by company
   * GET /currencies/company/:companyId
   */
  @Get('company/:companyId')
  async getCurrenciesByCompany(
    @Req() req: any,
    @Param('companyId', ParseUUIDPipe) companyId: string,
  ) {
    return this.currencyService.getCurrenciesByCompany(req.user.userId, companyId);
  }

  /**
   * Update currency
   * PUT /currencies/:id
   */
  @Put(':id')
  async update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currencyService.update(req.user.userId, id, updateCurrencyDto);
  }

  /**
   * Delete currency
   * DELETE /currencies/:id
   */
  @Delete(':id')
  async delete(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.currencyService.delete(req.user.userId, id);
  }

  // ============ EXCHANGE RATE ENDPOINTS ============

  /**
   * Create exchange rate
   * POST /currencies/exchange-rates
   */
  @Post('exchange-rates')
  async createExchangeRate(
    @Req() req: any,
    @Body() createExchangeRateDto: CreateExchangeRateDto,
  ) {
    return this.currencyService.createExchangeRate(req.user.userId, createExchangeRateDto);
  }

  /**
   * Get latest exchange rate between two currencies
   * GET /currencies/exchange-rates/latest?baseCurrencyId=xxx&targetCurrencyId=xxx
   */
  @Get('exchange-rates/latest')
  async getLatestExchangeRate(
    @Req() req: any,
    @Query('baseCurrencyId', ParseUUIDPipe) baseCurrencyId: string,
    @Query('targetCurrencyId', ParseUUIDPipe) targetCurrencyId: string,
  ) {
    return this.currencyService.getLatestExchangeRate(
      req.user.userId,
      baseCurrencyId,
      targetCurrencyId,
    );
  }

  /**
   * Get all exchange rates for a currency
   * GET /currencies/:id/exchange-rates
   */
  @Get(':id/exchange-rates')
  async getExchangeRatesForCurrency(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.currencyService.getExchangeRatesForCurrency(req.user.userId, id);
  }
}
