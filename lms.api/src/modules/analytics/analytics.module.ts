import { Module } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { AnalyticsService } from 'src/modules/analytics/analytics.service';
import { TeacherAnalyticsController } from 'src/modules/analytics/controllers/teacher-analytics.controller';
import { AdminAnalyticsController } from './controllers/admin-analytics.controller';

@Module({
  controllers: [AdminAnalyticsController, TeacherAnalyticsController],
  providers: [AnalyticsService, PrismaService],
})
export class AnalyticsModule {}
