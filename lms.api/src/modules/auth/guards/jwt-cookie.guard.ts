import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtCookieAuthGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req: Request & { user?: any } = context.switchToHttp().getRequest();
    const access =
      req.cookies?.['access_token'] ||
      req.headers?.authorization?.split(' ')[1];

    if (!access) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload = jwt.verify(
        access,
        this.config.get<string>('JWT_SECRET', 'change-me'),
      ) as any;
      req.user = { id: payload.sub };
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
