import { Controller, Get } from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';


@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('test-db')
  async testDB() {
    const users = await this.prisma.user.findMany();
    return { message: 'Database Connected', users };
  }
}
