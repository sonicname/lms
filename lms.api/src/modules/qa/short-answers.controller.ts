import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PrismaService } from 'src/databases/prisma.service';
import { Roles } from 'src/modules/auth/constants/roles.decorator';
import { Role } from 'src/modules/auth/constants/roles.enum';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { CreateAnswerDto } from 'src/modules/qa/dtos/create-answer.dto';
import { UpdateAnswerDto } from 'src/modules/qa/dtos/update-answer.dto';
import { QaService } from 'src/modules/qa/qa.service';
import { ShortCreateAnswerDocs } from './docs/short-create-answer.docs';
import { ShortDeleteAnswerDocs } from './docs/short-delete-answer.docs';
import { ShortListAnswersDocs } from './docs/short-list-answers.docs';
import { ShortUpdateAnswerDocs } from './docs/short-update-answer.docs';

@Controller()
@ApiTags('Q&A - Answers')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class ShortAnswersController {
  constructor(
    private readonly service: QaService,
    private readonly prisma: PrismaService,
  ) {}

  // Short: /questions/:questionId/answers (list)
  @Get('questions/:questionId/answers')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ShortListAnswersDocs()
  async list(
    @Req() req: Request & { user?: { id: string } },
    @Param('questionId') questionId: string,
  ) {
    const role = await this.getRole(req);
    const q = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: {
        lessonId: true,
        lesson: {
          select: { chapterId: true, chapter: { select: { classId: true } } },
        },
      },
    });
    if (!q) return Promise.reject(new Error('Question not found'));
    return this.service.listAnswers(
      req.user!.id,
      role,
      q.lesson.chapter.classId,
      q.lesson.chapterId,
      q.lessonId,
      questionId,
    );
  }

  // Short: /questions/:questionId/answers (create)
  @Post('questions/:questionId/answers')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ShortCreateAnswerDocs()
  async create(
    @Req() req: Request & { user?: { id: string } },
    @Param('questionId') questionId: string,
    @Body() dto: CreateAnswerDto,
  ) {
    const role = await this.getRole(req);
    const q = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: {
        lessonId: true,
        lesson: {
          select: { chapterId: true, chapter: { select: { classId: true } } },
        },
      },
    });
    if (!q) return Promise.reject(new Error('Question not found'));
    return this.service.createAnswer(
      req.user!.id,
      role,
      q.lesson.chapter.classId,
      q.lesson.chapterId,
      q.lessonId,
      questionId,
      dto,
    );
  }

  // Short: /answers/:answerId (update)
  @Patch('answers/:answerId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ShortUpdateAnswerDocs()
  async update(
    @Req() req: Request & { user?: { id: string } },
    @Param('answerId') answerId: string,
    @Body() dto: UpdateAnswerDto,
  ) {
    const role = await this.getRole(req);
    const a = await this.prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        questionId: true,
        question: {
          select: {
            lesson: { select: { chapter: { select: { classId: true } } } },
          },
        },
      },
    });
    if (!a) return Promise.reject(new Error('Answer not found'));
    return this.service.updateAnswer(
      req.user!.id,
      role,
      a.question.lesson.chapter.classId,
      a.questionId,
      answerId,
      dto,
    );
  }

  // Short: /answers/:answerId (delete)
  @Delete('answers/:answerId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ShortDeleteAnswerDocs()
  async delete(
    @Req() req: Request & { user?: { id: string } },
    @Param('answerId') answerId: string,
  ) {
    const role = await this.getRole(req);
    const a = await this.prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        questionId: true,
        question: {
          select: {
            lesson: { select: { chapter: { select: { classId: true } } } },
          },
        },
      },
    });
    if (!a) return Promise.reject(new Error('Answer not found'));
    return this.service.deleteAnswer(
      req.user!.id,
      role,
      a.question.lesson.chapter.classId,
      a.questionId,
      answerId,
    );
  }

  private async getRole(req: Request & { user?: { id: string } }) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { role: true },
    });
    return user?.role as Role;
  }
}
