// src/vendor/vendor.repository.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';

@Injectable()
export class VendorRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new vendor
   */
  async create(dto: CreateVendorDto) {
    // Check if vendor code already exists for this company
    const existingVendor = await this.prisma.vendor.findUnique({
      where: {
        companyId_code: {
          companyId: dto.companyId,
          code: dto.code,
        },
      },
    });

    if (existingVendor) {
      throw new BadRequestException(`Vendor with code '${dto.code}' already exists for this company`);
    }

    // Verify company exists
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID '${dto.companyId}' not found`);
    }

    // Verify currency exists if provided
    if (dto.currencyId) {
      const currency = await this.prisma.currency.findUnique({
        where: { id: dto.currencyId },
      });

      if (!currency) {
        throw new NotFoundException(`Currency with ID '${dto.currencyId}' not found`);
      }
    }

    return this.prisma.vendor.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        currency: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Find all vendors with filtering and pagination
   */
  async findAll(query: QueryVendorDto) {
    const { companyId, search, isActive, page = 1, limit = 10 } = query;

    const where: any = {};

    if (companyId) {
      where.companyId = companyId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
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
          currency: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          vendorUsers: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return {
      data: vendors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find vendor by ID
   */
  async findById(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        currency: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        vendorUsers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
        purchaseOrders: {
          select: {
            id: true,
            number: true,
            status: true,
            orderDate: true,
            grandTotal: true,
          },
          orderBy: {
            orderDate: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID '${id}' not found`);
    }

    return vendor;
  }

  /**
   * Find vendor by company and code
   */
  async findByCompanyAndCode(companyId: string, code: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: {
        companyId_code: {
          companyId,
          code,
        },
      },
      include: {
        company: true,
        currency: true,
        vendorUsers: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with code '${code}' not found for this company`);
    }

    return vendor;
  }

  /**
   * Update vendor
   */
  async update(id: string, dto: UpdateVendorDto) {
    // Check if vendor exists
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID '${id}' not found`);
    }

    // If updating code, check for uniqueness within the company
    if (dto.code && dto.code !== vendor.code) {
      const existingVendor = await this.prisma.vendor.findUnique({
        where: {
          companyId_code: {
            companyId: vendor.companyId,
            code: dto.code,
          },
        },
      });

      if (existingVendor) {
        throw new BadRequestException(`Vendor with code '${dto.code}' already exists for this company`);
      }
    }

    // Verify currency exists if provided
    if (dto.currencyId) {
      const currency = await this.prisma.currency.findUnique({
        where: { id: dto.currencyId },
      });

      if (!currency) {
        throw new NotFoundException(`Currency with ID '${dto.currencyId}' not found`);
      }
    }

    return this.prisma.vendor.update({
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
        currency: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete vendor (soft delete by setting isActive to false)
   */
  async softDelete(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID '${id}' not found`);
    }

    return this.prisma.vendor.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete vendor
   */
  async hardDelete(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        purchaseOrders: true,
      },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID '${id}' not found`);
    }

    // Check if vendor has purchase orders
    if (vendor.purchaseOrders && vendor.purchaseOrders.length > 0) {
      throw new BadRequestException(
        `Cannot delete vendor with existing purchase orders. Please use soft delete instead.`
      );
    }

    return this.prisma.vendor.delete({
      where: { id },
    });
  }

  /**
   * Get vendor statistics
   */
  async getVendorStats(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID '${vendorId}' not found`);
    }

    const [totalPOs, totalSpent, activePOs] = await Promise.all([
      this.prisma.purchaseOrder.count({
        where: { vendorId },
      }),
      this.prisma.purchaseOrder.aggregate({
        where: { vendorId },
        _sum: {
          grandTotal: true,
        },
      }),
      this.prisma.purchaseOrder.count({
        where: {
          vendorId,
          status: {
            in: ['DRAFT', 'SUBMITTED', 'UNDER_APPROVAL', 'APPROVED', 'ISSUED'],
          },
        },
      }),
    ]);

    return {
      vendorId,
      totalPurchaseOrders: totalPOs,
      totalSpent: totalSpent._sum.grandTotal || 0,
      activePurchaseOrders: activePOs,
    };
  }
}
