import { Module } from '@nestjs/common';
import { OrgService } from './org.service';
import { OrgController } from './org.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [OrgService, PrismaService],
  controllers: [OrgController],
})
export class OrgModule {}
