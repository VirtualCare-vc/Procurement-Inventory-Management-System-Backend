import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const orgId = req.params.organizationId;

    const membership = await this.prisma.membership.findFirst({
      where: { userId: user.id, organizationId: orgId },
      select: { role: true },
    });

    if (!membership || !requiredRoles.includes(membership.role))
      throw new ForbiddenException('Not authorized');

    return true;
  }
}
