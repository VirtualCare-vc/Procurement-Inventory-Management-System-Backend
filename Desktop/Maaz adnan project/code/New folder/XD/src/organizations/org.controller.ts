import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrgService } from './org.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrgController {
  constructor(private orgService: OrgService) {}

  @Get()
  getAll() {
    return this.orgService.getOrganizations();
  }
}
