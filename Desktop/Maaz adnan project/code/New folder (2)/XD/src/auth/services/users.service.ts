import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { TenantRepository } from '../repositories/tenant.repository';
import { RoleRepository } from '../repositories/role.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private tenantRepository: TenantRepository,
    private roleRepository: RoleRepository,
    private prisma: PrismaService
  ) {}


  async createUser(createUserDto: CreateUserDto) {

    const tenant = await this.tenantRepository.create(createUserDto.tenantName, `${createUserDto.tenantName}-code`);

    let role = await this.roleRepository.findByName('Super Admin');

    if (!role) {
      role = await this.roleRepository.create('Super Admin', 'Default super administrator role');
    }
    
    const user = await this.userRepository.create(createUserDto, tenant.id, role.id);

    return user;
  }


  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findTenant(name: string) {
    return this.userRepository.tenantExist(name);
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Assign a user to a company with a role
   */
  async assignUserToCompany(userId: string, companyId: string, role: string) {
    // Upsert: if already exists, update role; else create
    return this.prisma.companyUser.upsert({
      where: { userId_companyId: { userId, companyId } },
      update: { role },
      create: { userId, companyId, role },
    }); 
  }

  /**
   * Assign multiple users to a company
   */
  async assignUsersToCompany(companyId: string, users: { userId: string; role: string }[]) {
    // Bulk upsert is not natively supported by Prisma, so do sequentially
    const results : any = [];
    for (const { userId, role } of users) {
      const res = await this.assignUserToCompany(userId, companyId, role);
      results.push(res);
    }
    return results;
  }

  /**
   * Remove a user from a company
   */
  async removeUserFromCompany(userId: string, companyId: string) {
    return this.prisma.companyUser.delete({
      where: { userId_companyId: { userId, companyId } },
    });
  }

  // ============ VENDOR USER METHODS ============

  /**
   * Assign a user to a vendor with a role
   */
  async assignUserToVendor(userId: string, vendorId: string, role: string) {
    // Upsert: if already exists, update role; else create
    return this.prisma.vendorUser.upsert({
      where: { userId_vendorId: { userId, vendorId } },
      update: { role },
      create: { userId, vendorId, role },
    });
  }

  /**
   * Assign multiple users to a vendor
   */
  async assignUsersToVendor(vendorId: string, users: { userId: string; role: string }[]) {
    // Bulk upsert is not natively supported by Prisma, so do sequentially
    const results: any = [];
    for (const { userId, role } of users) {
      const res = await this.assignUserToVendor(userId, vendorId, role);
      results.push(res);
    }
    return results;
  }

  /**
   * Remove a user from a vendor
   */
  async removeUserFromVendor(userId: string, vendorId: string) {
    return this.prisma.vendorUser.delete({
      where: { userId_vendorId: { userId, vendorId } },
    });
  }

}
