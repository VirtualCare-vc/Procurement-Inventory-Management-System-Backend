import { Module } from '@nestjs/common';
import { UomController } from './controllers/uom.controller';
import { UomService } from './services/uom.service';
import { UomRepository } from './repositories/uom.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UomController],
  providers: [UomService, UomRepository],
  exports: [UomService, UomRepository],
})
export class UomModule {}
