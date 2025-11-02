import { Module } from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { SubmissionsController } from 'src/modules/tests/submissions.controller';
import { TestsController } from 'src/modules/tests/tests.controller';
import { TestsService } from 'src/modules/tests/tests.service';

@Module({
  controllers: [TestsController, SubmissionsController],
  providers: [TestsService, PrismaService],
})
export class TestsModule {}
