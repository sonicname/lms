import { Module } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { UsersController } from 'src/modules/users/users.controller';
import { UsersService } from 'src/modules/users/users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
  imports: [],
})
export class UsersModule {}
