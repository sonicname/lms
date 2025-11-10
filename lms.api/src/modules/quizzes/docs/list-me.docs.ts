import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagedQuizSchema } from './schemas';

export const ListMyQuizzesDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List my quizzes (paginated)' }),
    ApiResponse({
      status: 200,
      description: 'Quizzes paginated list',
      schema: PagedQuizSchema,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
