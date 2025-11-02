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
import { AttachTestAssetsDocs } from './docs/attach-assets.docs';
import { CreateTestDocs } from './docs/create-test.docs';
import { GetTestDocs } from './docs/get-test.docs';
import { ListTestsDocs } from './docs/list-tests.docs';
import { UpdateTestDocs } from './docs/update-test.docs';
import { AttachAssetsDto } from './dtos/attach-assets.dto';
import { CreateTestDto } from './dtos/create-test.dto';
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
