import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ImportQuizzesByTagsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Import quizzes into a test by tag(s) (teacher only)',
    }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'testId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          tagIds: { type: 'array', items: { type: 'string' }, nullable: true },
          tagNames: {
            type: 'array',
            items: { type: 'string' },
            nullable: true,
          },
          points: { type: 'number', nullable: true },
          startOrder: { type: 'number', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Import result' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
