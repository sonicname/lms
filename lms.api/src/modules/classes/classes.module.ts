import { Module } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

@Module({
  controllers: [ClassesController],
  providers: [ClassesService, PrismaService, JwtCookieAuthGuard, RolesGuard],
})
export class ClassesModule {}
