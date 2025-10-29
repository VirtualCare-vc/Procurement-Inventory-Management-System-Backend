// src/auth/dto/create-user.dto.ts
export class CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  tenantName: string;
}


import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}