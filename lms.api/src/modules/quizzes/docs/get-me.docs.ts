import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuizSchema } from './schemas';

export const GetMyQuizDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get my quiz by id' }),
    ApiResponse({
      status: 200,
      description: 'Quiz detail',
      schema: QuizSchema,
    }),
    ApiResponse({ status: 404, description: 'Quiz not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
