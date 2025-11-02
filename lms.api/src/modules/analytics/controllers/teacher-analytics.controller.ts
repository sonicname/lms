import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { TeacherOnly } from 'src/modules/auth/constants/roles.decorator';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AnalyticsService } from '../analytics.service';
import { TeacherClassOverviewDocs } from '../docs/teacher-class-overview.docs';
import { TeacherOverviewDocs } from '../docs/teacher-overview.docs';

@Controller('analytics/teacher')
@ApiTags('Analytics')
@UseGuards(JwtCookieAuthGuard, RolesGuard)
@ApiCookieAuth('access_token')
export class TeacherAnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('overview')
  @TeacherOnly()
  @TeacherOverviewDocs()
  async overview(@Req() req: Request & { user?: { id: string } }) {
    return this.service.teacherOverview(req.user!.id);
  }

  @Get('classes/:classId/overview')
  @TeacherOnly()
  @TeacherClassOverviewDocs()
  async classOverview(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
  ) {
    return this.service.teacherClassOverview(req.user!.id, classId);
  }
}
