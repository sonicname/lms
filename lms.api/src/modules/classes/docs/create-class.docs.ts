import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const CreateClassDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create class (admin or teacher)' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          code: { type: 'string', minLength: 3, maxLength: 32 },
          teacherId: { type: 'string', description: 'Admin only' },
        },
        required: ['name', 'code'],
      },
    }),
    ApiResponse({ status: 201, description: 'Class created' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 409, description: 'Conflict - code already exists' }),
  );
