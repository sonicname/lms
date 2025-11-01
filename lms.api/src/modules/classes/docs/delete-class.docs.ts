import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const DeleteClassDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete class (admin or owning teacher)' }),
    ApiResponse({
      status: 200,
      description: 'Deleted',
      schema: {
        type: 'object',
        properties: { success: { type: 'boolean', example: true } },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
  );
