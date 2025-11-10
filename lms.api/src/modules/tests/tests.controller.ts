import {
  Body,
  Controller,
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
import {
  AttachEssayQuestionAssetsDocs,
  AttachTestAssetsDocs,
  CreateEssayQuestionDocs,
  CreateTestDocs,
  DeleteEssayQuestionDocs,
  GetTestDocs,
  ImportQuizzesByTagsDocs,
  ListEssayQuestionsDocs,
  ListTestsDocs,
  UpdateEssayQuestionDocs,
  UpdateTestDocs,
} from './docs';
import { AttachAssetsDto } from './dtos/attach-assets.dto';
import { CreateTestDto } from './dtos/create-test.dto';
import { CreateEssayQuestionDto } from './dtos/essay/create-essay-question.dto';
import { UpdateEssayQuestionDto } from './dtos/essay/update-essay-question.dto';
import { ImportQuizzesByTagsDto } from './dtos/import-quizzes-by-tags.dto';
import { UpdateTestDto } from './dtos/update-test.dto';
import { TestsService } from './tests.service';

@Controller('classes/:classId/tests')
@ApiTags('Tests')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class TestsController {
  constructor(
    private readonly service: TestsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @CreateTestDocs()
  async create(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Body() dto: CreateTestDto,
  ) {
    return this.service.createTest(req.user!.id, classId, dto);
  }

  // Import quizzes by tag(s) into MCQ test
  @Post(':testId/import-quizzes')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @ImportQuizzesByTagsDocs()
  async importQuizzes(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
    @Body() dto: ImportQuizzesByTagsDto,
  ) {
    return this.service.importQuizzesByTags(req.user!.id, classId, testId, dto);
  }

  @Patch(':testId')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @UpdateTestDocs()
  async update(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
    @Body() dto: UpdateTestDto,
  ) {
    return this.service.updateTest(req.user!.id, classId, testId, dto);
  }

  // -------- Essay Questions CRUD --------
  @Get(':testId/essay-questions')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ListEssayQuestionsDocs()
  async listEssayQuestions(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
  ) {
    const role = await this.getRole(req);
    return this.service.listEssayQuestions(req.user!.id, role, classId, testId);
  }

  @Post(':testId/essay-questions')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @CreateEssayQuestionDocs()
  async createEssayQuestion(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
    @Body() dto: CreateEssayQuestionDto,
  ) {
    return this.service.createEssayQuestion(req.user!.id, classId, testId, dto);
  }

  @Patch(':testId/essay-questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @UpdateEssayQuestionDocs()
  async updateEssayQuestion(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateEssayQuestionDto,
  ) {
    return this.service.updateEssayQuestion(
      req.user!.id,
      classId,
      testId,
      questionId,
      dto,
    );
  }

  @Post(':testId/essay-questions/:questionId/assets')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @AttachEssayQuestionAssetsDocs()
  async attachEssayAssets(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
    @Param('questionId') questionId: string,
    @Body() dto: AttachAssetsDto,
  ) {
    return this.service.attachAssetsToEssayQuestion(
      req.user!.id,
      classId,
      testId,
      questionId,
      dto.assetIds,
    );
  }

  @Post(':testId/essay-questions/:questionId/delete')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @DeleteEssayQuestionDocs()
  async deleteEssayQuestion(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
    @Param('questionId') questionId: string,
  ) {
    return this.service.deleteEssayQuestion(
      req.user!.id,
      classId,
      testId,
      questionId,
    );
  }

  @Post(':testId/assets')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @AttachTestAssetsDocs()
  async attachAssets(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
    @Body() dto: AttachAssetsDto,
  ) {
    return this.service.attachAssetsToTest(
      req.user!.id,
      classId,
      testId,
      dto.assetIds,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ListTestsDocs()
  async list(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
  ) {
    const role = await this.getRole(req);
    return this.service.listTests(req.user!.id, role, classId);
  }

  @Get(':testId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @GetTestDocs()
  async getOne(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
  ) {
    const role = await this.getRole(req);
    return this.service.getTest(req.user!.id, role, classId, testId);
  }

  private async getRole(req: Request & { user?: { id: string } }) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { role: true },
    });
    return user?.role as Role;
  }
}
