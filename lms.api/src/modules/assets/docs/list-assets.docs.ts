import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const ListAssetsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List assets (role-based scope)' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search by filename or type (contains, case-insensitive)',
    }),
    ApiQuery({ name: 'type', required: false, type: String }),
    ApiQuery({ name: 'fileType', required: false, type: String }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      enum: ['createdAt', 'filename', 'fileSize'],
    }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    ApiResponse({
      status: 200,
      description: 'Paginated assets',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
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
          },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              totalPages: { type: 'number' },
            },
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
