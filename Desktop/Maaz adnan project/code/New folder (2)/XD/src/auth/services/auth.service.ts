// src/auth/services/auth.service.ts
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CreateCompanyDto, UpdateCompanyDto, UpdateMeDto, UpdateTenantDto } from '../dto/company.dto';
import { UserRepository } from '../repositories/user.repository';
import { CompanyRepository } from '../repositories/company.repository';
import { PrismaService } from '../../prisma/prisma.service';

import { AssignUserToCompanyDto, AssignUsersToCompanyDto, RemoveUserFromCompanyDto } from '../dto/assign-user-company.dto';
import { AssignUserToVendorDto, AssignUsersToVendorDto, RemoveUserFromVendorDto } from '../dto/assign-user-vendor.dto';

@Injectable()
export class AuthService {
  private readonly saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

  constructor(
   private usersService: UsersService,
    private userRepo: UserRepository,
    private companyRepo: CompanyRepository,
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async signup(createUserDto: CreateUserDto) {
    // 1) email unique?
    const emailExists = await this.usersService.findByEmail(createUserDto.email);
    if (emailExists) {
      throw new BadRequestException('Email already in use');
    }

    // 2) tenant unique?
    const tenantExist = await this.usersService.findTenant(createUserDto.tenantName);
    if (tenantExist) {
      throw new BadRequestException('Tenant name already in use');
    }

    // 3) hash password securely
    const hashedPassword = await bcrypt.hash(createUserDto.password, this.saltRounds);

    // 4) create user with hashed password
    const user = await this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    // 5) issue JWT
    const payload = { email: user.email, sub: user.id };
    return {
      user: this.sanitizeUser(user), // don’t leak password hash
      access_token: this.jwtService.sign(payload),
    };
  }


   async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { email: user.email, sub: user.id };
    return {
      user: this.sanitizeUser(user),
      access_token: this.jwtService.sign(payload),
    };
  }


// src/auth/services/auth.service.ts

async createCompany(userId: string, dto: CreateCompanyDto) {
  const user = await this.usersService.findById(userId);
  if (!user) throw new UnauthorizedException();

  // Optional: ensure user has no company yet (or allow multiple)
  // if (user.companyId) throw new BadRequestException('User already has a company');

  // Code uniqueness (global)
  const codeExists = await this.prisma.company.findUnique({ 
    where: { code: dto.code } 
  });
  if (codeExists) throw new BadRequestException('Company code already in use');

  // Pass createdById
  const company = await this.companyRepo.create(user.tenantId, dto, userId);

  return { company };
}

  // ────────────────────────────────────── UPDATE COMPANY
  async updateCompany(userId: string, companyId: string, dto: UpdateCompanyDto) {
    const user = await this.usersService.findById(userId);
    if(!user) throw new UnauthorizedException();  
    await this.companyRepo.findByIdAndTenant(companyId, user.tenantId); // throws if not found/owned

    const updated = await this.companyRepo.update(companyId, user.tenantId, dto);
    return { company: updated };
  }

  async updateTenant(userId: string, dto: UpdateTenantDto) {
    const user = await this.usersService.findById(userId);
    if(!user) throw new UnauthorizedException();  
    const updated = await this.companyRepo.updateTenant(user.tenantId, dto);
    return { tenant: updated };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const data: any = {};
    if (dto.fullName) data.fullName = dto.fullName;
    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, this.saltRounds);
    }

    const updated = await this.userRepo.updateMe(userId, data);
    return { user: this.sanitizeUser(updated) };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return this.sanitizeUser(user);
  }

  private sanitizeUser<T extends { password?: string }>(user: T) {
    const { password, ...rest } = user;
    return rest;
  }


  async addUserToTenant(
    adminId: string,
    payload: {
      email: string;
      password: string;
      fullName: string;
      roleId?: string;
      tenantId: string;
      companyId?: string[]; // ← optional array
    },
  ) {
    const admin = await this.usersService.findById(adminId);
    if (!admin) throw new UnauthorizedException('Admin not found');
  
    if (admin.tenantId !== payload.tenantId) {
      throw new ForbiddenException('Cannot add user to another tenant');
    }
  
    // Validate companyId array if provided
    if (payload.companyId && payload.companyId.length > 0) {
      // Fetch all companies in parallel
      const companyDetailsList = await Promise.all(
        payload.companyId.map(id => this.userRepo.getCompanyById(id))
      );
  
      // Check each company
      for (let i = 0; i < companyDetailsList.length; i++) {
        const company = companyDetailsList[i];
        const companyId = payload.companyId[i];
  
        if (!company) {
          throw new BadRequestException(`Invalid company ID: ${companyId}`);
        }
  
        if (company.tenantId !== payload.tenantId) {
          throw new BadRequestException(`Company ${companyId} does not belong to the specified tenant`);
        }
  
        if (company.createdById !== admin.id) {
          console.log("company.createdById", company.createdById);
          console.log("admin.id", admin.id);
          throw new ForbiddenException(`You can only assign users to your own company (ID: ${companyId})`);
        }
      }
    }
  
    const hashed = await bcrypt.hash(payload.password, this.saltRounds);
  
    const user = await this.companyRepo.addUserToTenant({...payload,companyIds: payload.companyId}, hashed);
  
    return { user: this.sanitizeUser(user) };
  }

// --- NEW COMPANY ASSIGNMENT METHODS ---
/**
 * Assign a single user to a company
 */
async assignUserToCompany(requesterId: string, dto: AssignUserToCompanyDto) {
  // Optionally: check tenant, permissions, etc.
  return this.usersService.assignUserToCompany(dto.userId, dto.companyId, dto.role);
}

/**
 * Assign multiple users to a company
 */
async assignUsersToCompany(requesterId: string, dto: AssignUsersToCompanyDto) {
  // Optionally: check tenant, permissions, etc.
  return this.usersService.assignUsersToCompany(dto.companyId, dto.users as { userId: string; role: string }[]);
}

/**
 * Remove a user from a company
 */
async removeUserFromCompany(requesterId: string, dto: RemoveUserFromCompanyDto) {
  // Optionally: check tenant, permissions, etc.
  return this.usersService.removeUserFromCompany(dto.userId, dto.companyId);
}
// --- END NEW COMPANY ASSIGNMENT METHODS ---

// --- VENDOR USER ASSIGNMENT METHODS ---
/**
 * Assign a single user to a vendor
 */
async assignUserToVendor(requesterId: string, dto: AssignUserToVendorDto) {
  // Optionally: check tenant, permissions, etc.
  return this.usersService.assignUserToVendor(dto.userId, dto.vendorId, dto.role);
}

/**
 * Assign multiple users to a vendor
 */
async assignUsersToVendor(requesterId: string, dto: AssignUsersToVendorDto) {
  // Optionally: check tenant, permissions, etc.
  return this.usersService.assignUsersToVendor(dto.vendorId, dto.users as { userId: string; role: string }[]);
}

/**
 * Remove a user from a vendor
 */
async removeUserFromVendor(requesterId: string, dto: RemoveUserFromVendorDto) {
  // Optionally: check tenant, permissions, etc.
  return this.usersService.removeUserFromVendor(dto.userId, dto.vendorId);
}
// --- END VENDOR USER ASSIGNMENT METHODS ---

}
