// add-user-to-tenant.dto.ts
import { IsEmail, IsString, IsOptional, IsUUID } from 'class-validator';

export class AddUserToTenantDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
   @IsString()
  roleId?: string;

   @IsString()
  tenantId: string;

  @IsOptional()
  companyId?: string[];
}