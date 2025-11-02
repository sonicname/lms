import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const TeacherOverviewDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Teacher analytics overview (my classes)' }),
    ApiResponse({ status: 200, description: 'Overview metrics returned' }),
  );
