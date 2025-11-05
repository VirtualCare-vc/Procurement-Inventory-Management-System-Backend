// src/auth/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, tenantId: string, roleId: string) {
    // Create the user and associate with the tenant and role
    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: createUserDto.password,
        fullName: createUserDto.fullName,
        tenant: {
          connect: { id: tenantId },
        },
        role: {
          connect: { id: roleId },    
        },
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async tenantExist(tenantName: string) {
    return this.prisma.tenant.findFirst({
      where: { name: tenantName },
    });
  }



 async updateMe(userId: string, data: { fullName?: string; password?: string }) {
    const updateData: any = {};
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.password) updateData.password = data.password; // already hashed

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }


  async getCompanyById (id: string) {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }


}
