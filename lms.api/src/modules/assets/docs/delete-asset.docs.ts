import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const DeleteAssetDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete asset (admin or owner)' }),
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
