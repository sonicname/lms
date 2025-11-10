import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuizSchema } from './schemas';

export const CreateMyQuizDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create my quiz' }),
    ApiResponse({ status: 201, description: 'Created', schema: QuizSchema }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
