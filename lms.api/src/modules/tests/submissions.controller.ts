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
import { Roles } from 'src/modules/auth/constants/roles.decorator';
import { Role } from 'src/modules/auth/constants/roles.enum';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { GradeSubmissionDocs } from './docs/grade-submission.docs';
import { ListSubmissionsDocs } from './docs/list-submissions.docs';
import { SubmitMcqAnswersDocs } from './docs/submit-mcq-answers.docs';
import { SubmitTestDocs } from './docs/submit-test.docs';
import { GradeSubmissionDto } from './dtos/grade-submission.dto';
import { SubmitMcqAnswersDto } from './dtos/submit-mcq.dto';
import { SubmitTestDto } from './dtos/submit-test.dto';
import { TestsService } from './tests.service';

@Controller('classes/:classId/tests/:testId/submissions')
@ApiTags('Submissions')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class SubmissionsController {
  constructor(private readonly service: TestsService) {}

  // Student submits/updates submission
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @SubmitTestDocs()
  async submit(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
    @Body() dto: SubmitTestDto,
  ) {
    return this.service.submitTest(req.user!.id, classId, testId, dto.assetIds);
  }

  // Student submits MCQ answers
  @Post('mcq')
  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @SubmitMcqAnswersDocs()
  async submitMcq(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
    @Body() dto: SubmitMcqAnswersDto,
  ) {
    return this.service.submitMcqAnswers(
      req.user!.id,
      classId,
      testId,
      dto.answers,
    );
  }

  // Teacher lists submissions
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @ListSubmissionsDocs()
  async list(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
  ) {
    return this.service.listSubmissions(req.user!.id, classId, testId);
  }

  // Teacher grades a submission
  @Patch(':submissionId/grade')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @GradeSubmissionDocs()
  async grade(
    @Req() req: Request & { user?: { id: string } },
    @Param('classId') classId: string,
    @Param('testId') testId: string,
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.service.gradeSubmission(
      req.user!.id,
      classId,
      testId,
      submissionId,
      dto,
    );
  }
}
