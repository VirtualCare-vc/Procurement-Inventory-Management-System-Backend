import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { FilterItemDto } from '../dto/filter-item.dto';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class ItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, data: CreateItemDto) {
    return this.prisma.item.create({
      data: {
        ...data,
        companyId,
      },
      include: {
        uom: true,
        currency: true,
        preferredVendor: true,
        company: true,
      },
    });
  }

  async findAll(filters: FilterItemDto) {
    const where: Prisma.ItemWhereInput = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.isService !== undefined) {
      where.isService = filters.isService;
    }

    if (filters.trackInventory !== undefined) {
      where.trackInventory = filters.trackInventory;
    }

    if (filters.preferredVendorId) {
      where.preferredVendorId = filters.preferredVendorId;
    }

    if (filters.currencyId) {
      where.currencyId = filters.currencyId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.item.findMany({
      where,
      include: {
        uom: true,
        currency: true,
        preferredVendor: true,
        company: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.item.findUnique({
      where: { id },
      include: {
        uom: true,
        currency: true,
        preferredVendor: true,
        company: true,
      },
    });
  }

  async findByCode(companyId: string, code: string) {
    return this.prisma.item.findUnique({
      where: {
        companyId_code: {
          companyId,
          code,
        },
      },
      include: {
        uom: true,
        currency: true,
        preferredVendor: true,
        company: true,
      },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.item.findMany({
      where: { companyId },
      include: {
        uom: true,
        currency: true,
        preferredVendor: true,
        company: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByCategory(companyId: string, category: string) {
    return this.prisma.item.findMany({
      where: {
        companyId,
        category,
      },
      include: {
        uom: true,
        currency: true,
        preferredVendor: true,
        company: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async update(id: string, data: UpdateItemDto) {
    return this.prisma.item.update({
      where: { id },
      data,
      include: {
        uom: true,
        currency: true,
        preferredVendor: true,
        company: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.item.delete({
      where: { id },
    });
  }

  async softDelete(id: string) {
    return this.prisma.item.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async checkCodeExists(companyId: string, code: string, excludeId?: string) {
    const where: Prisma.ItemWhereInput = {
      companyId,
      code,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const item = await this.prisma.item.findFirst({ where });
    return !!item;
  }

  async isItemUsedInPurchaseOrders(itemId: string): Promise<boolean> {
    const count = await this.prisma.purchaseOrderLine.count({
      where: { itemId },
    });
    return count > 0;
  }

  async getItemStatistics(itemId: string) {
    const purchaseOrderLines = await this.prisma.purchaseOrderLine.findMany({
      where: { itemId },
      include: {
        purchaseOrder: true,
      },
    });

    const totalOrders = purchaseOrderLines.length;
    const totalQuantity = purchaseOrderLines.reduce(
      (sum, line) => sum + Number(line.qty),
      0,
    );
    const totalValue = purchaseOrderLines.reduce(
      (sum, line) => sum + Number(line.lineTotal),
      0,
    );

    return {
      totalOrders,
      totalQuantity,
      totalValue,
    };
  }

  async getLowStockItems(companyId: string) {
    // This is a placeholder - actual stock tracking would require inventory transactions
    return this.prisma.item.findMany({
      where: {
        companyId,
        trackInventory: true,
        isActive: true,
      },
      include: {
        uom: true,
        currency: true,
        preferredVendor: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
