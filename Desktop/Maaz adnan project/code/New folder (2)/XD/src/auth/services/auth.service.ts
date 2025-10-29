// src/auth/services/auth.service.ts
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    // 1) email unique?
    const emailExists = await this.usersService.findByEmail(createUserDto.email);
    if (emailExists) {
      throw new BadRequestException('Email already in use');
    }

    // 2) tenant unique?
    const tenantExist = await this.usersService.findTenant(createUserDto.tenantName);
    if (tenantExist) {
      throw new BadRequestException('Tenant name already in use');
    }

    // 3) hash password securely
    const hashedPassword = await bcrypt.hash(createUserDto.password, this.saltRounds);

    // 4) create user with hashed password
    const user = await this.usersService.createUser({
      ...createUserDto,
      password: hashedPassword,
    });

    // 5) issue JWT
    const payload = { email: user.email, sub: user.id };
    return {
      user: this.sanitizeUser(user), // don’t leak password hash
      access_token: this.jwtService.sign(payload),
    };
  }


   async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = { email: user.email, sub: user.id };
    return {
      user: this.sanitizeUser(user),
      access_token: this.jwtService.sign(payload),
    };
  }


  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return this.sanitizeUser(user);
  }

  private sanitizeUser<T extends { password?: string }>(user: T) {
    const { password, ...rest } = user;
    return rest;
  }
}
