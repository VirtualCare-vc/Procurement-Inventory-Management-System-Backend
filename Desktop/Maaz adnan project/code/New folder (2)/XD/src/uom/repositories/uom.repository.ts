import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUomDto } from '../dto/create-uom.dto';
import { UpdateUomDto } from '../dto/update-uom.dto';
import { CreateUomConversionDto } from '../dto/create-uom-conversion.dto';
import { FilterUomDto } from '../dto/filter-uom.dto';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class UomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: string, data: CreateUomDto) {
    return this.prisma.uoM.create({
      data: {
        ...data,
        companyId,
      },
      include: {
        company: true,
      },
    });
  }

  async findAll(filters: FilterUomDto) {
    const where: Prisma.UoMWhereInput = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { symbol: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.uoM.findMany({
      where,
      include: {
        company: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.uoM.findUnique({
      where: { id },
      include: {
        company: true,
        fromConversions: {
          include: {
            toUom: true,
          },
        },
        toConversions: {
          include: {
            fromUom: true,
          },
        },
      },
    });
  }

  async findByCode(companyId: string, code: string) {
    return this.prisma.uoM.findUnique({
      where: {
        companyId_code: {
          companyId,
          code,
        },
      },
      include: {
        company: true,
      },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.uoM.findMany({
      where: { companyId },
      include: {
        company: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async update(id: string, data: UpdateUomDto) {
    return this.prisma.uoM.update({
      where: { id },
      data,
      include: {
        company: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.uoM.delete({
      where: { id },
    });
  }

  async softDelete(id: string) {
    return this.prisma.uoM.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async checkCodeExists(companyId: string, code: string, excludeId?: string) {
    const where: Prisma.UoMWhereInput = {
      companyId,
      code,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const uom = await this.prisma.uoM.findFirst({ where });
    return !!uom;
  }

  async isUomUsedInItems(uomId: string): Promise<boolean> {
    const count = await this.prisma.item.count({
      where: { uomId },
    });
    return count > 0;
  }

  async isUomUsedInPurchaseOrders(uomId: string): Promise<boolean> {
    const count = await this.prisma.purchaseOrderLine.count({
      where: { uomId },
    });
    return count > 0;
  }

  // UOM Conversion methods
  async createConversion(data: CreateUomConversionDto) {
    return this.prisma.uoMConversion.create({
      data,
      include: {
        fromUom: true,
        toUom: true,
      },
    });
  }

  async findConversion(fromUomId: string, toUomId: string) {
    return this.prisma.uoMConversion.findFirst({
      where: {
        fromUomId,
        toUomId,
      },
      include: {
        fromUom: true,
        toUom: true,
      },
    });
  }

  async findAllConversions() {
    return this.prisma.uoMConversion.findMany({
      include: {
        fromUom: true,
        toUom: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findConversionsByUom(uomId: string) {
    return this.prisma.uoMConversion.findMany({
      where: {
        OR: [{ fromUomId: uomId }, { toUomId: uomId }],
      },
      include: {
        fromUom: true,
        toUom: true,
      },
    });
  }

  async deleteConversion(id: string) {
    return this.prisma.uoMConversion.delete({
      where: { id },
    });
  }

  async updateConversion(id: string, conversionRate: number) {
    return this.prisma.uoMConversion.update({
      where: { id },
      data: { conversionRate },
      include: {
        fromUom: true,
        toUom: true,
      },
    });
  }
}
