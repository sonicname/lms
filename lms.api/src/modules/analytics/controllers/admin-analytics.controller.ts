import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from 'src/modules/auth/constants/roles.decorator';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AnalyticsService } from '../analytics.service';
import { AdminClassOverviewDocs } from '../docs/admin-class-overview.docs';
import { AdminEngagementDocs } from '../docs/admin-engagement.docs';
import { AdminOverviewDocs } from '../docs/admin-overview.docs';
import { DateRangeDto } from '../dtos/date-range.dto';

@Controller('analytics/admin')
@ApiTags('Analytics')
@UseGuards(JwtCookieAuthGuard, RolesGuard)
@ApiCookieAuth('access_token')
export class AdminAnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('overview')
  @AdminOnly()
  @AdminOverviewDocs()
  async overview() {
    return this.service.adminOverview();
  }

  @Get('engagement')
  @AdminOnly()
  @AdminEngagementDocs()
  async engagement(@Query() { from, to }: DateRangeDto) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.service.adminEngagement(fromDate, toDate);
  }

  @Get('classes/:classId/overview')
  @AdminOnly()
  @AdminClassOverviewDocs()
  async classOverview(@Param('classId') classId: string) {
    return this.service.adminClassOverview(classId);
  }
}
