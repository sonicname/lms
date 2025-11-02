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
import { CreateQuestionDto } from 'src/modules/qa/dtos/create-question.dto';
import { UpdateQuestionDto } from 'src/modules/qa/dtos/update-question.dto';
import { QaService } from 'src/modules/qa/qa.service';
import { ShortCreateLessonQuestionDocs } from './docs/short-create-lesson-question.docs';
import { ShortDeleteQuestionDocs } from './docs/short-delete-question.docs';
import { ShortGetQuestionDocs } from './docs/short-get-question.docs';
import { ShortListLessonQuestionsDocs } from './docs/short-list-lesson-questions.docs';
import { ShortUpdateQuestionDocs } from './docs/short-update-question.docs';

@Controller()
@ApiTags('Q&A - Questions')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class ShortQuestionsController {
  constructor(
    private readonly service: QaService,
    private readonly prisma: PrismaService,
  ) {}

  // Short: /lessons/:lessonId/questions (list)
  @Get('lessons/:lessonId/questions')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ShortListLessonQuestionsDocs()
  async listByLesson(
    @Req() req: Request & { user?: { id: string } },
    @Param('lessonId') lessonId: string,
  ) {
    const role = await this.getRole(req);
    const ctx = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { chapterId: true, chapter: { select: { classId: true } } },
    });
    if (!ctx) return Promise.reject(new Error('Lesson not found'));
    return this.service.listQuestions(
      req.user!.id,
      role,
      ctx.chapter.classId,
      ctx.chapterId,
      lessonId,
    );
  }

  // Short: /lessons/:lessonId/questions (create)
  @Post('lessons/:lessonId/questions')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ShortCreateLessonQuestionDocs()
  async createInLesson(
    @Req() req: Request & { user?: { id: string } },
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    const role = await this.getRole(req);
    const ctx = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { chapterId: true, chapter: { select: { classId: true } } },
    });
    if (!ctx) return Promise.reject(new Error('Lesson not found'));
    return this.service.createQuestion(
      req.user!.id,
      role,
      ctx.chapter.classId,
      ctx.chapterId,
      lessonId,
      dto,
    );
  }

  // Short: /questions/:questionId (get)
  @Get('questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ShortGetQuestionDocs()
  async getOne(
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
    return this.service.getQuestion(
      req.user!.id,
      role,
      q.lesson.chapter.classId,
      q.lesson.chapterId,
      q.lessonId,
      questionId,
    );
  }

  // Short: /questions/:questionId (update)
  @Patch('questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ShortUpdateQuestionDocs()
  async update(
    @Req() req: Request & { user?: { id: string } },
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
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
    return this.service.updateQuestion(
      req.user!.id,
      role,
      q.lesson.chapter.classId,
      q.lesson.chapterId,
      q.lessonId,
      questionId,
      dto,
    );
  }

  // Short: /questions/:questionId (delete)
  @Delete('questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ShortDeleteQuestionDocs()
  async delete(
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
    return this.service.deleteQuestion(
      req.user!.id,
      role,
      q.lesson.chapter.classId,
      q.lesson.chapterId,
      q.lessonId,
      questionId,
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
