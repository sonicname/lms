import { Module } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { AssetsController } from 'src/modules/assets/assets.controller';
import { AssetsService } from 'src/modules/assets/assets.service';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService],
})
export class AssetsModule {}
