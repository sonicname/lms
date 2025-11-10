import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuizSchema } from './schemas';

export const UpdateMyQuizDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update my quiz' }),
    ApiResponse({ status: 200, description: 'Updated', schema: QuizSchema }),
    ApiResponse({ status: 404, description: 'Quiz not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
