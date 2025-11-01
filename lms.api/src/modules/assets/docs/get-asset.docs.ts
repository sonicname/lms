import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetAssetDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get asset by id (role-based scope)' }),
    ApiResponse({
      status: 200,
      description: 'Asset',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          fileType: { type: 'string' },
          filename: { type: 'string' },
          mimetype: { type: 'string' },
          fileSize: { type: 'number' },
          url: { type: 'string' },
          type: { type: 'string', nullable: true },
          userId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
  );
