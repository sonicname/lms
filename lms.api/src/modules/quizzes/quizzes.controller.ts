import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtCookieAuthGuard } from '../auth/guards/jwt-cookie.guard';
import {
  CreateChoiceDocs,
  DeleteChoiceDocs,
  ListChoicesDocs,
  UpdateChoiceDocs,
} from './docs/choices.docs';
import { CreateMyQuizDocs } from './docs/create-me.docs';
import { DeleteMyQuizDocs } from './docs/delete-me.docs';
import { GetMyQuizDocs } from './docs/get-me.docs';
import { ListMyQuizzesDocs } from './docs/list-me.docs';
import { UpdateMyQuizDocs } from './docs/update-me.docs';
import { CreateChoiceDto } from './dtos/create-choice.dto';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { UpdateChoiceDto } from './dtos/update-choice.dto';
import { UpdateQuizDto } from './dtos/update-quiz.dto';
import { QuizzesService } from './quizzes.service';

@Controller('quizzes')
@ApiTags('Quizzes')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  @Get('me')
  @ListMyQuizzesDocs()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listMine(
    @Req() req: Request & { user?: { id: string } },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? parseInt(page, 10) || 1 : 1;
    const l = limit ? parseInt(limit, 10) || 10 : 10;
    return this.quizzes.listMyQuizzes(req.user!.id, p, l);
  }

  @Post('me')
  @CreateMyQuizDocs()
  async createMine(
    @Req() req: Request & { user?: { id: string } },
    @Body() dto: CreateQuizDto,
  ) {
    return this.quizzes.createMyQuiz(req.user!.id, dto);
  }

  @Get('me/:id')
  @GetMyQuizDocs()
  async getMine(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') id: string,
  ) {
    return this.quizzes.getMyQuiz(req.user!.id, id);
  }

  @Patch('me/:id')
  @UpdateMyQuizDocs()
  async updateMine(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzes.updateMyQuiz(req.user!.id, id, dto);
  }

  @Delete('me/:id')
  @DeleteMyQuizDocs()
  async deleteMine(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') id: string,
  ) {
    return this.quizzes.deleteMyQuiz(req.user!.id, id);
  }

  // Choices nested
  @Get('me/:quizId/choices')
  @ListChoicesDocs()
  async listChoices(
    @Req() req: Request & { user?: { id: string } },
    @Param('quizId') quizId: string,
  ) {
    return this.quizzes.listChoices(req.user!.id, quizId);
  }

  @Post('me/:quizId/choices')
  @CreateChoiceDocs()
  async createChoice(
    @Req() req: Request & { user?: { id: string } },
    @Param('quizId') quizId: string,
    @Body() dto: CreateChoiceDto,
  ) {
    return this.quizzes.createChoice(req.user!.id, quizId, dto);
  }

  @Patch('me/:quizId/choices/:choiceId')
  @UpdateChoiceDocs()
  async updateChoice(
    @Req() req: Request & { user?: { id: string } },
    @Param('quizId') quizId: string,
    @Param('choiceId') choiceId: string,
    @Body() dto: UpdateChoiceDto,
  ) {
    return this.quizzes.updateChoice(req.user!.id, quizId, choiceId, dto);
  }

  @Delete('me/:quizId/choices/:choiceId')
  @DeleteChoiceDocs()
  async deleteChoice(
    @Req() req: Request & { user?: { id: string } },
    @Param('quizId') quizId: string,
    @Param('choiceId') choiceId: string,
  ) {
    return this.quizzes.deleteChoice(req.user!.id, quizId, choiceId);
  }

  // ----- Tags management -----
  @Get('me/:quizId/tags')
  async listTags(
    @Req() req: Request & { user?: { id: string } },
    @Param('quizId') quizId: string,
  ) {
    return this.quizzes.listTags(req.user!.id, quizId);
  }

  @Post('me/:quizId/tags')
  async attachTags(
    @Req() req: Request & { user?: { id: string } },
    @Param('quizId') quizId: string,
    @Body() body: { names: string[] },
  ) {
    return this.quizzes.attachTagsByNames(
      req.user!.id,
      quizId,
      body.names || [],
    );
  }

  @Delete('me/:quizId/tags/:tagId')
  async detachTag(
    @Req() req: Request & { user?: { id: string } },
    @Param('quizId') quizId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.quizzes.detachTag(req.user!.id, quizId, tagId);
  }

  // Global tags list for current user (for suggestions)
  @Get('tags')
  async listAllTags(@Req() req: Request & { user?: { id: string } }) {
    return this.quizzes.listAllTags(req.user!.id);
  }
}
