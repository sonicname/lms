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
import { Roles } from 'src/modules/auth/constants/roles.decorator';
import { Role } from 'src/modules/auth/constants/roles.enum';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { CurriculumService } from './curriculum.service';
import { CreateLessonDocs } from './docs/create-lesson.docs';
import { DeleteLessonDocs } from './docs/delete-lesson.docs';
import { GetLessonDocs } from './docs/get-lesson.docs';
import { ListLessonAssetsDocs } from './docs/list-lesson-assets.docs';
import { ListLessonsDocs } from './docs/list-lessons.docs';
import { UpdateLessonDocs } from './docs/update-lesson.docs';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { UpdateLessonDto } from './dtos/update-lesson.dto';

@Controller('classes/:classId/chapters/:chapterId/lessons')
@ApiTags('Lessons')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class LessonsController {
  constructor(private readonly service: CurriculumService) {}

  // Teacher: create lesson
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @CreateLessonDocs()
  async create(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.service.createLesson(req.user!.id, classId, chapterId, dto);
  }

  // Teacher: update lesson
  @Patch(':lessonId')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @UpdateLessonDocs()
  async update(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.service.updateLesson(
      req.user!.id,
      classId,
      chapterId,
      lessonId,
      dto,
    );
  }

  // Teacher: delete lesson
  @Delete(':lessonId')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @DeleteLessonDocs()
  async remove(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
  ) {
    return this.service.deleteLesson(
      req.user!.id,
      classId,
      chapterId,
      lessonId,
    );
  }

  // Read: student, teacher, admin
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ListLessonsDocs()
  async list(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
  ) {
    const actorRole = await this.getRole(req);
    return this.service.listLessons(
      req.user!.id,
      actorRole,
      classId,
      chapterId,
    );
  }

  @Get(':lessonId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @GetLessonDocs()
  async getOne(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
  ) {
    const actorRole = await this.getRole(req);
    return this.service.getLesson(
      req.user!.id,
      actorRole,
      classId,
      chapterId,
      lessonId,
    );
  }

  // Assets of lesson
  @Get(':lessonId/assets')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ListLessonAssetsDocs()
  async assets(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Param('lessonId') lessonId: string,
  ) {
    const actorRole = await this.getRole(req);
    return this.service.listLessonAssets(
      req.user!.id,
      actorRole,
      classId,
      chapterId,
      lessonId,
    );
  }

  private async getRole(req: Request & { user?: { id: string } }) {
    const user = await (this as any).service['prisma'].user.findUnique({
      where: { id: req.user!.id },
      select: { role: true },
    });
    return user?.role as Role;
  }
}
