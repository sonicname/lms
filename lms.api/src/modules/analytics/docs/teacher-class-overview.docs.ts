import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const TeacherClassOverviewDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Teacher class overview analytics' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Class analytics returned' }),
  );
