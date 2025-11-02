import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ShortListLessonQuestionsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List questions by lesson' }),
    ApiParam({ name: 'lessonId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'List of questions' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Lesson not found' }),
  );
