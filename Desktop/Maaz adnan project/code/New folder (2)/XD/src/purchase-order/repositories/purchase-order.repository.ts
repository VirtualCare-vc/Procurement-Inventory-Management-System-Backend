import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class PurchaseOrderRepository {
  constructor(private prisma: PrismaService) {}

  // Create Purchase Order with lines
  async create(data: Prisma.PurchaseOrderCreateInput) {
    return this.prisma.purchaseOrder.create({
      data,
      include: {
        company: true,
        vendor: true,
        site: true,
        currency: true,
        exchangeRate: true,
        lines: {
          include: {
            item: true,
            uom: true,
          },
          orderBy: {
            lineNo: 'asc',
          },
        },
      },
    });
  }

  // Find all with filters
  async findAll(filters: {
    companyId?: string;
    vendorId?: string;
    siteId?: string;
    status?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.PurchaseOrderWhereInput = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.vendorId) {
      where.vendorId = filters.vendorId;
    }

    if (filters.siteId) {
      where.siteId = filters.siteId;
    }

    if (filters.status) {
      where.status = filters.status as any;
    }

    if (filters.search) {
      where.OR = [
        { number: { contains: filters.search, mode: 'insensitive' } },
        { remarks: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.orderDate = {};
      if (filters.startDate) {
        where.orderDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.orderDate.lte = filters.endDate;
      }
    }

    const orderBy: any = {};
    const sortBy = filters.sortBy || 'orderDate';
    const sortOrder = filters.sortOrder || 'desc';
    orderBy[sortBy] = sortOrder;

    return this.prisma.purchaseOrder.findMany({
      where,
      include: {
        company: true,
        vendor: true,
        site: true,
        currency: true,
        exchangeRate: true,
        lines: {
          include: {
            item: true,
            uom: true,
          },
          orderBy: {
            lineNo: 'asc',
          },
        },
      },
      orderBy,
    });
  }

  // Find by ID
  async findById(id: string) {
    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        company: true,
        vendor: true,
        site: true,
        currency: true,
        exchangeRate: true,
        lines: {
          include: {
            item: true,
            uom: true,
          },
          orderBy: {
            lineNo: 'asc',
          },
        },
      },
    });
  }

  // Find by number and company
  async findByNumber(companyId: string, number: string) {
    return this.prisma.purchaseOrder.findUnique({
      where: {
        companyId_number: {
          companyId,
          number,
        },
      },
      include: {
        company: true,
        vendor: true,
        site: true,
        currency: true,
        exchangeRate: true,
        lines: {
          include: {
            item: true,
            uom: true,
          },
          orderBy: {
            lineNo: 'asc',
          },
        },
      },
    });
  }

  // Update Purchase Order
  async update(id: string, data: Prisma.PurchaseOrderUpdateInput) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data,
      include: {
        company: true,
        vendor: true,
        site: true,
        currency: true,
        exchangeRate: true,
        lines: {
          include: {
            item: true,
            uom: true,
          },
          orderBy: {
            lineNo: 'asc',
          },
        },
      },
    });
  }

  // Delete Purchase Order
  async delete(id: string) {
    // This will cascade delete all lines due to Prisma relations
    return this.prisma.purchaseOrder.delete({
      where: { id },
    });
  }

  // Update PO status
  async updateStatus(id: string, status: string, updatedById?: string) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: status as any,
        updatedById,
      },
      include: {
        company: true,
        vendor: true,
        site: true,
        currency: true,
        exchangeRate: true,
        lines: {
          include: {
            item: true,
            uom: true,
          },
          orderBy: {
            lineNo: 'asc',
          },
        },
      },
    });
  }

  // Get next PO number for a company
  async getNextNumber(companyId: string): Promise<string> {
    const lastPO = await this.prisma.purchaseOrder.findFirst({
      where: { companyId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });

    if (!lastPO) {
      return 'PO-00001';
    }

    // Extract number from format like "PO-00001"
    const match = lastPO.number.match(/PO-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1]) + 1;
      return `PO-${nextNum.toString().padStart(5, '0')}`;
    }

    return 'PO-00001';
  }

  // Check if vendor exists and belongs to company
  async validateVendor(vendorId: string, companyId: string) {
    return this.prisma.vendor.findFirst({
      where: {
        id: vendorId,
        companyId,
        isActive: true,
      },
    });
  }

  // Check if site exists and belongs to company
  async validateSite(siteId: string, companyId: string) {
    return this.prisma.site.findFirst({
      where: {
        id: siteId,
        companyId,
        isActive: true,
      },
    });
  }

  // Check if currency exists and belongs to company
  async validateCurrency(currencyId: string, companyId: string) {
    return this.prisma.currency.findFirst({
      where: {
        id: currencyId,
        companyId,
      },
    });
  }

  // Get item details (for auto-filling price and tax)
  async getItemDetails(itemId: string, companyId: string) {
    return this.prisma.item.findFirst({
      where: {
        id: itemId,
        companyId,
        isActive: true,
      },
      include: {
        uom: true,
        currency: true,
      },
    });
  }

  // Get vendor's default currency
  async getVendorCurrency(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { currency: true },
    });
    return vendor?.currency;
  }

  // Get latest exchange rate
  async getLatestExchangeRate(baseCurrencyId: string, targetCurrencyId: string) {
    return this.prisma.exchangeRate.findFirst({
      where: {
        baseCurrencyId,
        targetCurrencyId,
      },
      orderBy: {
        effectiveDate: 'desc',
      },
    });
  }

  // Get PO statistics for a vendor
  async getVendorStatistics(vendorId: string, companyId: string) {
    const stats = await this.prisma.purchaseOrder.aggregate({
      where: {
        vendorId,
        companyId,
      },
      _count: true,
      _sum: {
        grandTotal: true,
      },
    });

    const statusBreakdown = await this.prisma.purchaseOrder.groupBy({
      by: ['status'],
      where: {
        vendorId,
        companyId,
      },
      _count: true,
    });

    return {
      totalOrders: stats._count,
      totalSpending: stats._sum.grandTotal || 0,
      statusBreakdown,
    };
  }
}
