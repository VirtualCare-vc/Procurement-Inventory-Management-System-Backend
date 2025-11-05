// src/currency/currency.service.ts
import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { CurrencyRepository } from './currency.repository';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { QueryCurrencyDto } from './dto/query-currency.dto';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurrencyService {
  constructor(
    private currencyRepository: CurrencyRepository,
    private prisma: PrismaService,
  ) {}

  /**
   * Create a new currency
   */
  async create(userId: string, dto: CreateCurrencyDto) {
    // Verify user has access to the company
    await this.validateUserCompanyAccess(userId, dto.companyId);

    return this.currencyRepository.create(dto);
  }

  /**
   * Get all currencies with filtering
   */
  async findAll(userId: string, query: QueryCurrencyDto) {
    // If companyId is provided, validate user access
    if (query.companyId) {
      await this.validateUserCompanyAccess(userId, query.companyId);
    }

    return this.currencyRepository.findAll(query);
  }

  /**
   * Get currency by ID
   */
  async findById(userId: string, id: string) {
    const currency = await this.currencyRepository.findById(id);
    
    // Validate user has access to the currency's company
    await this.validateUserCompanyAccess(userId, currency.companyId);

    return currency;
  }

  /**
   * Get currency by code
   */
  async findByCode(userId: string, code: string) {
    const currency = await this.currencyRepository.findByCode(code);
    
    // Validate user has access to the currency's company
    await this.validateUserCompanyAccess(userId, currency.companyId);

    return currency;
  }

  /**
   * Update currency
   */
  async update(userId: string, id: string, dto: UpdateCurrencyDto) {
    const currency = await this.currencyRepository.findById(id);
    
    // Validate user has access to the currency's company
    await this.validateUserCompanyAccess(userId, currency.companyId);

    return this.currencyRepository.update(id, dto);
  }

  /**
   * Delete currency
   */
  async delete(userId: string, id: string) {
    const currency = await this.currencyRepository.findById(id);
    
    // Validate user has access to the currency's company
    await this.validateUserCompanyAccess(userId, currency.companyId);

    return this.currencyRepository.delete(id);
  }

  /**
   * Get currencies by company
   */
  async getCurrenciesByCompany(userId: string, companyId: string) {
    await this.validateUserCompanyAccess(userId, companyId);
    
    return this.currencyRepository.findByCompany(companyId);
  }

  // ============ EXCHANGE RATE METHODS ============

  /**
   * Create exchange rate
   */
  async createExchangeRate(userId: string, dto: CreateExchangeRateDto) {
    // Verify user has access to both currencies' companies
    const [baseCurrency, targetCurrency] = await Promise.all([
      this.currencyRepository.findById(dto.baseCurrencyId),
      this.currencyRepository.findById(dto.targetCurrencyId),
    ]);

    await this.validateUserCompanyAccess(userId, baseCurrency.companyId);
    await this.validateUserCompanyAccess(userId, targetCurrency.companyId);

    return this.currencyRepository.createExchangeRate(dto);
  }

  /**
   * Get latest exchange rate
   */
  async getLatestExchangeRate(userId: string, baseCurrencyId: string, targetCurrencyId: string) {
    // Verify user has access to both currencies
    const [baseCurrency, targetCurrency] = await Promise.all([
      this.currencyRepository.findById(baseCurrencyId),
      this.currencyRepository.findById(targetCurrencyId),
    ]);

    await this.validateUserCompanyAccess(userId, baseCurrency.companyId);
    await this.validateUserCompanyAccess(userId, targetCurrency.companyId);

    return this.currencyRepository.getLatestExchangeRate(baseCurrencyId, targetCurrencyId);
  }

  /**
   * Get all exchange rates for a currency
   */
  async getExchangeRatesForCurrency(userId: string, currencyId: string) {
    const currency = await this.currencyRepository.findById(currencyId);
    
    await this.validateUserCompanyAccess(userId, currency.companyId);

    return this.currencyRepository.getExchangeRatesForCurrency(currencyId);
  }

  // ============ HELPER METHODS ============

  /**
   * Validate that user has access to a company
   */
  private async validateUserCompanyAccess(userId: string, companyId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyUsers: {
          where: { companyId },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user has access to this company
    if (user.companyUsers.length === 0) {
      throw new ForbiddenException('You do not have access to this company');
    }

    return true;
  }
}
