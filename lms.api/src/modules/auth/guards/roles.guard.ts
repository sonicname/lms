import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/databases/prisma.service';
import { ROLES_KEY } from 'src/modules/auth/constants/roles.decorator';
import { RoleValue } from 'src/modules/auth/constants/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleValue[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // no role requirement
    }

    const req = context.switchToHttp().getRequest() as {
      user?: { id?: string };
    };
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('Missing authenticated user');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const role = (user?.role || '').toLowerCase();

    if (!role) {
      throw new ForbiddenException('Insufficient role');
    }

    if (!requiredRoles.includes(role as RoleValue)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
