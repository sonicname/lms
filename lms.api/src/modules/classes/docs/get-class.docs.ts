import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetClassDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get class detail (admin or owning teacher)' }),
    ApiResponse({
      status: 200,
      description: 'Class detail with teacher and student enrollments',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string', nullable: true },
          code: { type: 'string' },
          teacherId: { type: 'string' },
          teacher: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
          },
          students: {
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
                  },
                },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
  );
