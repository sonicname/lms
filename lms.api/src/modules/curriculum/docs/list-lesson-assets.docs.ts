import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ListLessonAssetsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary:
        'List assets of a lesson (students blocked if before schedule date)',
    }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'chapterId', required: true, type: String }),
    ApiParam({ name: 'lessonId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'List of assets' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Lesson not found' }),
  );
