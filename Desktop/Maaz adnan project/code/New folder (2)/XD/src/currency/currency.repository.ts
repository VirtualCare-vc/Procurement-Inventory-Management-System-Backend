// src/currency/currency.repository.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { QueryCurrencyDto } from './dto/query-currency.dto';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';

@Injectable()
export class CurrencyRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new currency
   */
  async create(dto: CreateCurrencyDto) {
    // Check if currency code already exists globally
    const existingCurrency = await this.prisma.currency.findUnique({
      where: { code: dto.code },
    });

    if (existingCurrency) {
      throw new BadRequestException(`Currency with code '${dto.code}' already exists`);
    }

    // Verify company exists
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID '${dto.companyId}' not found`);
    }

    return this.prisma.currency.create({
      data: dto,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  /**
   * Find all currencies with filtering and pagination
   */
  async findAll(query: QueryCurrencyDto) {
    const { companyId, search, page = 1, limit = 50 } = query;

    const where: any = {};

    if (companyId) {
      where.companyId = companyId;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [currencies, total] = await Promise.all([
      this.prisma.currency.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: {
          code: 'asc',
        },
      }),
      this.prisma.currency.count({ where }),
    ]);

    return {
      data: currencies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find currency by ID
   */
  async findById(id: string) {
    const currency = await this.prisma.currency.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        baseRates: {
          include: {
            targetCurrency: true,
          },
          orderBy: {
            effectiveDate: 'desc',
          },
          take: 10,
        },
        targetRates: {
          include: {
            baseCurrency: true,
          },
          orderBy: {
            effectiveDate: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!currency) {
      throw new NotFoundException(`Currency with ID '${id}' not found`);
    }

    return currency;
  }

  /**
   * Find currency by code
   */
  async findByCode(code: string) {
    const currency = await this.prisma.currency.findUnique({
      where: { code },
      include: {
        company: true,
      },
    });

    if (!currency) {
      throw new NotFoundException(`Currency with code '${code}' not found`);
    }

    return currency;
  }

  /**
   * Update currency
   */
  async update(id: string, dto: UpdateCurrencyDto) {
    const currency = await this.prisma.currency.findUnique({
      where: { id },
    });

    if (!currency) {
      throw new NotFoundException(`Currency with ID '${id}' not found`);
    }

    // If updating code, check for uniqueness
    if (dto.code && dto.code !== currency.code) {
      const existingCurrency = await this.prisma.currency.findUnique({
        where: { code: dto.code },
      });

      if (existingCurrency) {
        throw new BadRequestException(`Currency with code '${dto.code}' already exists`);
      }
    }

    return this.prisma.currency.update({
      where: { id },
      data: dto,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  /**
   * Delete currency
   */
  async delete(id: string) {
    const currency = await this.prisma.currency.findUnique({
      where: { id },
      include: {
        vendors: true,
        purchaseOrders: true,
      },
    });

    if (!currency) {
      throw new NotFoundException(`Currency with ID '${id}' not found`);
    }

    // Check if currency is in use
    if (currency.vendors && currency.vendors.length > 0) {
      throw new BadRequestException(
        `Cannot delete currency that is assigned to vendors. Please reassign vendors first.`
      );
    }

    if (currency.purchaseOrders && currency.purchaseOrders.length > 0) {
      throw new BadRequestException(
        `Cannot delete currency that is used in purchase orders.`
      );
    }

    return this.prisma.currency.delete({
      where: { id },
    });
  }

  // ============ EXCHANGE RATE METHODS ============

  /**
   * Create exchange rate
   */
  async createExchangeRate(dto: CreateExchangeRateDto) {
    // Verify both currencies exist
    const [baseCurrency, targetCurrency] = await Promise.all([
      this.prisma.currency.findUnique({ where: { id: dto.baseCurrencyId } }),
      this.prisma.currency.findUnique({ where: { id: dto.targetCurrencyId } }),
    ]);

    if (!baseCurrency) {
      throw new NotFoundException(`Base currency with ID '${dto.baseCurrencyId}' not found`);
    }

    if (!targetCurrency) {
      throw new NotFoundException(`Target currency with ID '${dto.targetCurrencyId}' not found`);
    }

    if (dto.baseCurrencyId === dto.targetCurrencyId) {
      throw new BadRequestException('Base and target currencies cannot be the same');
    }

    return this.prisma.exchangeRate.create({
      data: {
        baseCurrencyId: dto.baseCurrencyId,
        targetCurrencyId: dto.targetCurrencyId,
        rate: dto.rate,
        effectiveDate: new Date(dto.effectiveDate),
      },
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });
  }

  /**
   * Get latest exchange rate between two currencies
   */
  async getLatestExchangeRate(baseCurrencyId: string, targetCurrencyId: string) {
    const exchangeRate = await this.prisma.exchangeRate.findFirst({
      where: {
        baseCurrencyId,
        targetCurrencyId,
        effectiveDate: {
          lte: new Date(),
        },
      },
      orderBy: {
        effectiveDate: 'desc',
      },
      include: {
        baseCurrency: true,
        targetCurrency: true,
      },
    });

    if (!exchangeRate) {
      throw new NotFoundException(
        `No exchange rate found for the specified currency pair`
      );
    }

    return exchangeRate;
  }

  /**
   * Get all exchange rates for a currency
   */
  async getExchangeRatesForCurrency(currencyId: string) {
    const currency = await this.prisma.currency.findUnique({
      where: { id: currencyId },
    });

    if (!currency) {
      throw new NotFoundException(`Currency with ID '${currencyId}' not found`);
    }

    const [baseRates, targetRates] = await Promise.all([
      this.prisma.exchangeRate.findMany({
        where: { baseCurrencyId: currencyId },
        include: {
          targetCurrency: true,
        },
        orderBy: {
          effectiveDate: 'desc',
        },
      }),
      this.prisma.exchangeRate.findMany({
        where: { targetCurrencyId: currencyId },
        include: {
          baseCurrency: true,
        },
        orderBy: {
          effectiveDate: 'desc',
        },
      }),
    ]);

    return {
      asBase: baseRates,
      asTarget: targetRates,
    };
  }

  /**
   * Get currencies by company
   */
  async findByCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID '${companyId}' not found`);
    }

    return this.prisma.currency.findMany({
      where: { companyId },
      orderBy: {
        code: 'asc',
      },
    });
  }
}
