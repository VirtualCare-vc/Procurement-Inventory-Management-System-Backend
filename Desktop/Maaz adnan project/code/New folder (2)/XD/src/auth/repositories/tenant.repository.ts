// src/auth/repositories/tenant.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TenantRepository {
  constructor(private prisma: PrismaService) {}

   async create(name: string, code: string, description?: string) {
    return this.prisma.tenant.upsert({
      where: { code },
      create: { name, code, description },
      update: { name, description }, 
    });
  }
}
