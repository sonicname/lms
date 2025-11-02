import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const DeleteLessonDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a lesson (teacher of class only)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'chapterId', required: true, type: String }),
    ApiParam({ name: 'lessonId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Lesson deleted' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Lesson not found' }),
  );
