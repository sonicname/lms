import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const ListStudentsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'List students in a class (admin or owning teacher)',
    }),
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: ['pending', 'approved'],
    }),
    ApiResponse({
      status: 200,
      description: 'Paginated list of students with enrollment status',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                studentId: { type: 'string' },
                status: { type: 'string', enum: ['pending', 'approved'] },
                approvedAt: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                },
                student: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    image: { type: 'string', nullable: true },
                  },
                },
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
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
  );
