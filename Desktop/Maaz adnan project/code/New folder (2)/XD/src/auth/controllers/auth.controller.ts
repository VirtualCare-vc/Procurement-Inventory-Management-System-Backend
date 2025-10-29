// src/auth/controllers/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto, LoginDto } from '../dto/create-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }


   @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

//   @UseGuards(JwtAuthGuard)
//   @Get('tenants')
//   async myTenants(@Req() req: any) {
//     // req.user is set by JwtStrategy.validate
//     // if you have a TenantsService, call that instead
//     return {
//       tenants: await this.authService['usersService'].getTenantsForUser(req.user.userId),
//     };
//   }


}
