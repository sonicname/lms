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
import { CreateQuestionDocs } from './docs/create-question.docs';
import { DeleteQuestionDocs } from './docs/delete-question.docs';
import { GetQuestionDocs } from './docs/get-question.docs';
import { ListQuestionsDocs } from './docs/list-questions.docs';
import { UpdateQuestionDocs } from './docs/update-question.docs';

@Controller('classes/:classId/chapters/:chapterId/lessons/:lessonId/questions')
@ApiTags('Q&A - Questions')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class QuestionsController {
  constructor(
    private readonly service: QaService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @CreateQuestionDocs()
  async create(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    const role = await this.getRole(req);
    return this.service.createQuestion(
      req.user!.id,
      role,
      classId,
      chapterId,
      lessonId,
      dto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ListQuestionsDocs()
  async list(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
  ) {
    const role = await this.getRole(req);
    return this.service.listQuestions(
      req.user!.id,
      role,
      classId,
      chapterId,
      lessonId,
    );
  }

  @Get(':questionId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @GetQuestionDocs()
  async getOne(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
    @Param('questionId') questionId: string,
  ) {
    const role = await this.getRole(req);
    return this.service.getQuestion(
      req.user!.id,
      role,
      classId,
      chapterId,
      lessonId,
      questionId,
    );
  }

  @Patch(':questionId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @UpdateQuestionDocs()
  async update(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    const role = await this.getRole(req);
    return this.service.updateQuestion(
      req.user!.id,
      role,
      classId,
      chapterId,
      lessonId,
      questionId,
      dto,
    );
  }

  @Delete(':questionId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @DeleteQuestionDocs()
  async delete(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
    @Param('questionId') questionId: string,
  ) {
    const role = await this.getRole(req);
    return this.service.deleteQuestion(
      req.user!.id,
      role,
      classId,
      chapterId,
      lessonId,
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
