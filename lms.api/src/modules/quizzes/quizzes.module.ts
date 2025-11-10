import { Module } from '@nestjs/common';
import { PrismaService } from '../../databases/prisma.service';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

@Module({
  controllers: [QuizzesController],
  providers: [QuizzesService, PrismaService],
  imports: [],
})
export class QuizzesModule {}
