// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './services/auth.service';
import { UsersService } from './services/users.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRepository } from './repositories/user.repository';
import { TenantRepository } from './repositories/tenant.repository';
import { RoleRepository } from './repositories/role.repository';

@Module({
  imports: [JwtModule.register({ secret: 'secretKey', signOptions: { expiresIn: '1h' } })],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersService,
    UserRepository,
    TenantRepository,
    RoleRepository,
    PrismaService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, UsersService],
})
export class AuthModule {}
