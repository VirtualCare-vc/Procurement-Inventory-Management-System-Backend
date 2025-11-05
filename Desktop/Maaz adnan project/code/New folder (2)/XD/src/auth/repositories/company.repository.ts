// src/auth/repositories/company.repository.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto, UpdateTenantDto } from '../dto/company.dto';
import { User } from 'generated/prisma';

@Injectable()

export class CompanyRepository {

  constructor(private prisma: PrismaService) { }

  async create(tenantId: string, dto: CreateCompanyDto,userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          tenantId,
          name: dto.name,
          code: dto.code,
          description: dto.description,
          createdById: userId,
        },
      });

      // Automatically add the creator to the company as admin
      await tx.companyUser.create({
        data: {
          userId: userId,
          companyId: company.id,
          role: 'admin', // Creator gets admin role
        },
      });

      return company;
    });
  }


// company.repo.ts or user.repo.ts
async addUserToTenant(
  payload: {
    email: string;
    fullName: string;
    roleId?: string;
    tenantId: string;
    companyIds?: string[]; // <-- now supports multiple
  },
  hashedPassword: string,
): Promise<User> {
  const { email, fullName, roleId, tenantId, companyIds } = payload;

  // 1. Create the user (without companyId)
  const user = await this.prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      roleId: roleId ?? null,
      tenantId,
      isActive: true,
    },
  });

  console.log("Company IDs:", companyIds);
  if (companyIds && companyIds.length > 0) {
    for (const companyId of companyIds) {
      try {
        console.log("Assigning user to company:", { userId: user.id, companyId });
  
        await this.prisma.companyUser.create({
          data: {
            userId: user.id,
            companyId,
            role: 'employee',
          },
        });
      } catch (error) {
        console.error(`Failed to assign user to company ${companyId}:`, error);
        throw new BadRequestException(
          `Could not assign user to company ${companyId}. It may not exist or belong to another tenant.`
        );
      }
    }
  }


  return user;
}



  async findByIdAndTenant(id: string, tenantId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId },
      include: { tenant: true },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, tenantId: string, dto: UpdateCompanyDto) {
    return this.prisma.company.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async updateTenant(tenantId: string, dto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: dto,
    });
  }
}