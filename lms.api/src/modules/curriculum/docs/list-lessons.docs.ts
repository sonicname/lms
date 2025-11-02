import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ListLessonsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary:
        'List lessons of a chapter (students see only available by schedule)',
    }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'chapterId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'List of lessons' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Chapter not found' }),
  );
