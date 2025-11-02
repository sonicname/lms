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
import { CreateChapterDocs } from './docs/create-chapter.docs';
import { DeleteChapterDocs } from './docs/delete-chapter.docs';
import { GetChapterDocs } from './docs/get-chapter.docs';
import { ListChaptersDocs } from './docs/list-chapters.docs';
import { UpdateChapterDocs } from './docs/update-chapter.docs';
import { CreateChapterDto } from './dtos/create-chapter.dto';
import { UpdateChapterDto } from './dtos/update-chapter.dto';
@Controller('classes/:classId/chapters')
@ApiTags('Chapters')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class ChaptersController {
  constructor(private readonly service: CurriculumService) {}

  // Teacher: create chapter
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @CreateChapterDocs()
  async create(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Body() dto: CreateChapterDto,
  ) {
    return this.service.createChapter(req.user!.id, classId, dto);
  }

  // Teacher: update chapter
  @Patch(':chapterId')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @UpdateChapterDocs()
  async update(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.service.updateChapter(req.user!.id, classId, chapterId, dto);
  }

  // Teacher: delete chapter
  @Delete(':chapterId')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @DeleteChapterDocs()
  async remove(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
  ) {
    return this.service.deleteChapter(req.user!.id, classId, chapterId);
  }

  // Read: student, teacher, admin
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @ListChaptersDocs()
  async list(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
  ) {
    const actorRole = await this.getRole(req);
    return this.service.listChapters(req.user!.id, actorRole, classId);
  }

  @Get(':chapterId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher, Role.Student)
  @GetChapterDocs()
  async getOne(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('chapterId') chapterId: string,
  ) {
    const actorRole = await this.getRole(req);
    return this.service.getChapter(req.user!.id, actorRole, classId, chapterId);
  }

  private async getRole(req: Request & { user?: { id: string } }) {
    const user = await (this as any).service['prisma'].user.findUnique({
      where: { id: req.user!.id },
      select: { role: true },
    });
    return user?.role as Role;
  }
}
