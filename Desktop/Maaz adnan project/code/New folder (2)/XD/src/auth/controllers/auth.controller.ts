// src/auth/controllers/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req, Patch, ParseUUIDPipe, Param } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto, LoginDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateCompanyDto, UpdateCompanyDto, UpdateMeDto, UpdateTenantDto } from '../dto/company.dto';
import { AddUserToTenantDto } from '../dto/add-user-to-tenant.dto';
import { AssignUserToCompanyDto, AssignUsersToCompanyDto, RemoveUserFromCompanyDto } from '../dto/assign-user-company.dto';
import { AssignUserToVendorDto, AssignUsersToVendorDto, RemoveUserFromVendorDto } from '../dto/assign-user-vendor.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }


  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Assign a single user to a company
  @UseGuards(JwtAuthGuard)
  @Post('company/assign-user')
  async assignUserToCompany(@Req() req: any, @Body() dto: AssignUserToCompanyDto) {
    // Optionally, check that the user belongs to the same tenant as req.user
    return this.authService.assignUserToCompany(req.user.userId, dto);
  }

  // Assign multiple users to a company
  @UseGuards(JwtAuthGuard)
  @Post('company/assign-users')
  async assignUsersToCompany(@Req() req: any, @Body() dto: AssignUsersToCompanyDto) {
    // Optionally, check that all users belong to the same tenant
    return this.authService.assignUsersToCompany(req.user.userId, dto);
  }

  // Remove a user from a company
  @UseGuards(JwtAuthGuard)
  @Post('company/remove-user')
  async removeUserFromCompany(@Req() req: any, @Body() dto: RemoveUserFromCompanyDto) {
    // Optionally, check tenant
    return this.authService.removeUserFromCompany(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-company')
  async createCompany(@Req() req: any, @Body() dto: CreateCompanyDto) {
    return this.authService.createCompany(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('company/:id')
  async updateCompany(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) companyId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.authService.updateCompany(req.user.userId, companyId, dto);
  }

  // ──────── TENANT ────────
  @UseGuards(JwtAuthGuard)
  @Patch('tenant')
  async updateTenant(@Req() req: any, @Body() dto: UpdateTenantDto) {
    return this.authService.updateTenant(req.user.userId, dto);
  }

  // ──────── USER (ME) ────────
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Req() req: any, @Body() dto: UpdateMeDto) {
    return this.authService.updateMe(req.user.userId, dto);
  }


@Post('tenant/users')
@UseGuards(JwtAuthGuard)
async addUserToTenant(
  @Req() req: any,
  @Body() payload: AddUserToTenantDto,
) {
  return this.authService.addUserToTenant(req.user.userId, payload);
}

// ============ VENDOR USER ENDPOINTS ============

// Assign a single user to a vendor
@UseGuards(JwtAuthGuard)
@Post('vendor/assign-user')
async assignUserToVendor(@Req() req: any, @Body() dto: AssignUserToVendorDto) {
  return this.authService.assignUserToVendor(req.user.userId, dto);
}

// Assign multiple users to a vendor
@UseGuards(JwtAuthGuard)
@Post('vendor/assign-users')
async assignUsersToVendor(@Req() req: any, @Body() dto: AssignUsersToVendorDto) {
  return this.authService.assignUsersToVendor(req.user.userId, dto);
}

// Remove a user from a vendor
@UseGuards(JwtAuthGuard)
@Post('vendor/remove-user')
async removeUserFromVendor(@Req() req: any, @Body() dto: RemoveUserFromVendorDto) {
  return this.authService.removeUserFromVendor(req.user.userId, dto);
}

}
