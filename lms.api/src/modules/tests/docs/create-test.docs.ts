import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const CreateTestDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a test (teacher of class only)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: ['essay', 'mcq'], nullable: true },
          startDate: { type: 'string', format: 'date-time', nullable: true },
          endDate: { type: 'string', format: 'date-time', nullable: true },
        },
        required: ['name'],
      },
    }),
    ApiResponse({ status: 201, description: 'Test created' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Class not found' }),
  );
