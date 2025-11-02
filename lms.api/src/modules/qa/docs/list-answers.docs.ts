import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ListAnswersDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List answers for a question' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'chapterId', required: true, type: String }),
    ApiParam({ name: 'lessonId', required: true, type: String }),
    ApiParam({ name: 'questionId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'List of answers' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Question not found' }),
  );
