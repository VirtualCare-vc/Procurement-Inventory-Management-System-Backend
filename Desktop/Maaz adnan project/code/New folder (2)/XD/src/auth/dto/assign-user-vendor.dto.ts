// src/auth/dto/assign-user-vendor.dto.ts
import { IsString, IsUUID, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO to assign a single user to a vendor
 */
export class AssignUserToVendorDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  vendorId: string;

  @IsString()
  @IsNotEmpty()
  role: string; // e.g., 'contact', 'manager', etc.
}

/**
 * DTO to assign multiple users to a vendor
 */
export class AssignUsersToVendorDto {
  @IsNotEmpty()
  vendorId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserRoleDto)
  users: UserRoleDto[];
}

class UserRoleDto {
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

/**
 * DTO to remove a user from a vendor
 */
export class RemoveUserFromVendorDto {
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  vendorId: string;
}
