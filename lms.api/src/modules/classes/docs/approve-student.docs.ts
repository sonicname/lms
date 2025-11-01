import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const ApproveStudentDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Teacher approves a student join request' }),
    ApiResponse({
      status: 200,
      description: 'Enrollment approved',
      schema: {
        type: 'object',
        properties: {
          classId: { type: 'string' },
          studentId: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'approved'] },
          approvedAt: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
  );
