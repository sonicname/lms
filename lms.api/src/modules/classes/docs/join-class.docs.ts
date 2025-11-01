import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const JoinClassDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Student requests to join a class' }),
    ApiResponse({
      status: 201,
      description: 'Join request created (pending)',
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
    ApiResponse({ status: 404, description: 'Class not found' }),
    ApiResponse({ status: 409, description: 'Already requested or enrolled' }),
  );
