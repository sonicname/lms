import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const KickStudentDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Teacher kicks a student from class' }),
    ApiResponse({
      status: 200,
      description: 'Removed',
      schema: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true } },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
  );
