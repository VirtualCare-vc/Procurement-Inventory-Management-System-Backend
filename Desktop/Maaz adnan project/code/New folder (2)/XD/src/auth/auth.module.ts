// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { AuthController } from './controllers/auth.controller';
import { POController } from './controllers/po.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRepository } from './repositories/user.repository';
import { TenantRepository } from './repositories/tenant.repository';
import { RoleRepository } from './repositories/role.repository';
import { CompanyRepository } from './repositories/company.repository';
import { POService } from './services/po.service';
import { PORepository } from './repositories/po.repository';

@Module({
  imports: [JwtModule.register({ secret: 'secretKey', signOptions: { expiresIn: '1h' } })],
  controllers: [AuthController, POController],
  providers: [
    AuthService,
    UsersService,
    UserRepository,
    CompanyRepository,
    TenantRepository,
    RoleRepository,
    POService,
    PORepository,
    PrismaService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, UsersService],
})
export class AuthModule {}
