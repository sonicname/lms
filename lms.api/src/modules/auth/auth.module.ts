import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/databases/prisma.service';
import { AppAuthController } from 'src/modules/auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';

@Module({
  imports: [ConfigModule],
  controllers: [AppAuthController],
  providers: [AuthService, PrismaService, JwtCookieAuthGuard, RolesGuard],
  exports: [JwtCookieAuthGuard, RolesGuard],
})
export class AppAuthModule {}
