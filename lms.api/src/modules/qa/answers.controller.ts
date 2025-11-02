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
import { CreateAnswerDocs } from './docs/create-answer.docs';
import { DeleteAnswerDocs } from './docs/delete-answer.docs';
import { ListAnswersDocs } from './docs/list-answers.docs';
import { UpdateAnswerDocs } from './docs/update-answer.docs';

@Controller(
  'classes/:classId/chapters/:chapterId/lessons/:lessonId/questions/:questionId/answers',
)
@ApiTags('Q&A - Answers')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class AnswersController {
  constructor(
    private readonly service: QaService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @CreateAnswerDocs()
  async create(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
    @Param('questionId') questionId: string,
    @Body() dto: CreateAnswerDto,
  ) {
    const role = await this.getRole(req);
    return this.service.createAnswer(
      req.user!.id,
      role,
      classId,
      chapterId,
      lessonId,
      questionId,
      dto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ListAnswersDocs()
  async list(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
    @Param('questionId') questionId: string,
  ) {
    const role = await this.getRole(req);
    return this.service.listAnswers(
      req.user!.id,
      role,
      classId,
      chapterId,
      lessonId,
      questionId,
    );
  }

  @Patch(':answerId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @UpdateAnswerDocs()
  async update(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('questionId') questionId: string,
    @Param('answerId') answerId: string,
    @Body() dto: UpdateAnswerDto,
  ) {
    const role = await this.getRole(req);
    return this.service.updateAnswer(
      req.user!.id,
      role,
      classId,
      questionId,
      answerId,
      dto,
    );
  }

  @Delete(':answerId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @DeleteAnswerDocs()
  async delete(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('questionId') questionId: string,
    @Param('answerId') answerId: string,
  ) {
    const role = await this.getRole(req);
    return this.service.deleteAnswer(
      req.user!.id,
      role,
      classId,
      questionId,
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
