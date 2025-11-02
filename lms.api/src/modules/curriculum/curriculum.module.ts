import { Module } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { ChaptersController } from 'src/modules/curriculum/chapters.controller';
import { CurriculumService } from 'src/modules/curriculum/curriculum.service';
import { LessonsController } from 'src/modules/curriculum/lessons.controller';

@Module({
  imports: [],
  controllers: [ChaptersController, LessonsController],
  providers: [CurriculumService, PrismaService],
})
export class CurriculumModule {}
