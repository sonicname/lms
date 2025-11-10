import { Module } from '@nestjs/common';
import { PrismaService } from '../../databases/prisma.service';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, PrismaService],
  imports: [],
})
export class ProfilesModule {}
