import { Module } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { QaService } from './qa.service';
import { ShortAnswersController } from './short-answers.controller';
import { ShortQuestionsController } from './short-questions.controller';

@Module({
  controllers: [ShortQuestionsController, ShortAnswersController],
  providers: [QaService, PrismaService],
})
export class QaModule {}
