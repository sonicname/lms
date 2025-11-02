import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const DeleteChapterDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a chapter (teacher of class only)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'chapterId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Chapter deleted' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Chapter not found' }),
  );
