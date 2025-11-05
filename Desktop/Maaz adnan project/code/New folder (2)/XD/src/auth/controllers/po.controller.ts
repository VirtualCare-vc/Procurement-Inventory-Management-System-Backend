import { Controller, Post, Body, UseGuards, Req, Get, Param, Patch, Query, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { POService } from '../services/po.service';
import { UsersService } from '../services/users.service';
import { CreatePODto } from '../dto/create-po.dto';
import { UpdatePODto } from '../dto/update-po.dto';
import { ChangePOStatusDto } from '../dto/change-status.dto';

@Controller('po')
export class POController {
  constructor(
    private readonly poService: POService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() dto: CreatePODto) {
  const user = await this.usersService.findById(req.user.userId);
  if (!user) throw new UnauthorizedException();
  return this.poService.create(user.tenantId, req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getById(@Req() req: any, @Param('id') id: string) {
  const user = await this.usersService.findById(req.user.userId);
  if (!user) throw new UnauthorizedException();
  return this.poService.getById(user.tenantId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Req() req: any, @Query('companyId') companyId: string) {
  const user = await this.usersService.findById(req.user.userId);
  if (!user) throw new UnauthorizedException();
  return this.poService.list(user.tenantId, companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePODto) {
  const user = await this.usersService.findById(req.user.userId);
  if (!user) throw new UnauthorizedException();
  return this.poService.update(user.tenantId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/action')
  async action(@Req() req: any, @Param('id') id: string, @Body() dto: ChangePOStatusDto) {
  const user = await this.usersService.findById(req.user.userId);
  if (!user) throw new UnauthorizedException();
  return this.poService.act(user.tenantId, id, dto.action as any);
  }
}
