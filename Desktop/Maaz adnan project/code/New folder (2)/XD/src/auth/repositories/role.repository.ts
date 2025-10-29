// src/auth/repositories/role.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private prisma: PrismaService) {}

  async findByName(name: string) {
    return this.prisma.role.findFirst({
      where: { name },
    });
  }

  /**
   * Creates a role with the provided name and optional description.
   * Returns the created role.
   */
  async create(name: string, description?: string) {
    return this.prisma.role.create({
      data: {
        name,
        description,
      },
    });
  }
}
