// src/auth/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
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
}
