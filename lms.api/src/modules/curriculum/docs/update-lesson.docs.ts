import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const UpdateLessonDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a lesson (teacher of class only)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'chapterId', required: true, type: String }),
    ApiParam({ name: 'lessonId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', nullable: true },
          content: { type: 'string', nullable: true },
          displayOrder: { type: 'number', nullable: true },
          scheduleDate: { type: 'string', format: 'date-time', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Lesson updated' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Lesson not found' }),
  );
