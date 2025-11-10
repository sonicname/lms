import { Module } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { AnswersController } from 'src/modules/qa/answers.controller';
import { QuestionsController } from 'src/modules/qa/questions.controller';
import { QaService } from './qa.service';
import { ShortAnswersController } from './short-answers.controller';
import { ShortQuestionsController } from './short-questions.controller';

@Module({
  controllers: [
    ShortQuestionsController,
    ShortAnswersController,
    AnswersController,
    QuestionsController,
  ],
  providers: [QaService, PrismaService],
})
export class QaModule {}
