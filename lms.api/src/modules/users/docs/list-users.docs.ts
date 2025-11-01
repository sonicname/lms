import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

export const ListUsersDocs = () =>
  applyDecorators(
    ApiCookieAuth('access_token'),
    ApiOperation({ summary: 'List users (admin)' }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search by name or email (contains, case-insensitive)',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Filter by name (contains, case-insensitive)',
    }),
    ApiQuery({
      name: 'email',
      required: false,
      type: String,
      description: 'Filter by email (contains, case-insensitive)',
    }),
    ApiQuery({
      name: 'role',
      required: false,
      enum: ['admin', 'teacher', 'student'],
    }),
    ApiQuery({ name: 'banned', required: false, type: Boolean }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      enum: ['createdAt', 'updatedAt', 'email', 'name', 'role'],
    }),
    ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of users',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string', format: 'email' },
                name: { type: 'string', nullable: true },
                image: { type: 'string', format: 'uri', nullable: true },
                role: { type: 'string', example: 'student' },
                banned: { type: 'boolean' },
                banReason: { type: 'string', nullable: true },
                banExpires: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                },
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
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' }),
  );
