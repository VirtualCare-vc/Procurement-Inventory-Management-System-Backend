// src/vendor/vendor.service.ts
import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { VendorRepository } from './vendor.repository';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { QueryVendorDto } from './dto/query-vendor.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorService {
  constructor(
    private vendorRepository: VendorRepository,
    private prisma: PrismaService,
  ) {}

  /**
   * Create a new vendor
   * Validates that the user has access to the company
   */
  async create(userId: string, dto: CreateVendorDto) {
    // Verify user has access to the company
    await this.validateUserCompanyAccess(userId, dto.companyId);

    return this.vendorRepository.create(dto);
  }

  /**
   * Get all vendors with filtering
   */
  async findAll(userId: string, query: QueryVendorDto) {
    // If companyId is provided, validate user access
    if (query.companyId) {
      await this.validateUserCompanyAccess(userId, query.companyId);
    } else {
      // If no companyId, get all companies user has access to
      const userCompanies = await this.getUserCompanies(userId);
      if (userCompanies.length === 0) {
        return {
          data: [],
          meta: {
            total: 0,
            page: query.page || 1,
            limit: query.limit || 10,
            totalPages: 0,
          },
        };
      }
      // Filter by user's companies
      query.companyId = userCompanies[0].id; // For simplicity, use first company
    }

    return this.vendorRepository.findAll(query);
  }

  /**
   * Get vendor by ID
   */
  async findById(userId: string, id: string) {
    const vendor = await this.vendorRepository.findById(id);
    
    // Validate user has access to the vendor's company
    await this.validateUserCompanyAccess(userId, vendor.companyId);

    return vendor;
  }

  /**
   * Get vendor by company and code
   */
  async findByCompanyAndCode(userId: string, companyId: string, code: string) {
    await this.validateUserCompanyAccess(userId, companyId);
    return this.vendorRepository.findByCompanyAndCode(companyId, code);
  }

  /**
   * Update vendor
   */
  async update(userId: string, id: string, dto: UpdateVendorDto) {
    const vendor = await this.vendorRepository.findById(id);
    
    // Validate user has access to the vendor's company
    await this.validateUserCompanyAccess(userId, vendor.companyId);

    return this.vendorRepository.update(id, dto);
  }

  /**
   * Soft delete vendor
   */
  async softDelete(userId: string, id: string) {
    const vendor = await this.vendorRepository.findById(id);
    
    // Validate user has access to the vendor's company
    await this.validateUserCompanyAccess(userId, vendor.companyId);

    return this.vendorRepository.softDelete(id);
  }

  /**
   * Hard delete vendor
   */
  async hardDelete(userId: string, id: string) {
    const vendor = await this.vendorRepository.findById(id);
    
    // Validate user has access to the vendor's company
    await this.validateUserCompanyAccess(userId, vendor.companyId);

    return this.vendorRepository.hardDelete(id);
  }

  /**
   * Get vendor statistics
   */
  async getStats(userId: string, vendorId: string) {
    const vendor = await this.vendorRepository.findById(vendorId);
    
    // Validate user has access to the vendor's company
    await this.validateUserCompanyAccess(userId, vendor.companyId);

    return this.vendorRepository.getVendorStats(vendorId);
  }

  /**
   * Get vendors by company
   */
  async getVendorsByCompany(userId: string, companyId: string, query: QueryVendorDto) {
    await this.validateUserCompanyAccess(userId, companyId);
    
    return this.vendorRepository.findAll({ ...query, companyId });
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

  /**
   * Get all companies a user has access to
   */
  private async getUserCompanies(userId: string) {
    const companyUsers = await this.prisma.companyUser.findMany({
      where: { userId },
      include: {
        company: true,
      },
    });

    return companyUsers.map(cu => cu.company);
  }
}
