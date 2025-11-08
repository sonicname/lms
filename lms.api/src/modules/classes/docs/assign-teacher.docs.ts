import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const AssignTeacherDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Assign teacher to class (admin only)' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          teacherId: { type: 'string' },
        },
        required: ['teacherId'],
      },
    }),
    ApiResponse({ status: 200, description: 'Teacher assigned' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
  );
