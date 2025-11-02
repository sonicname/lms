import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ListChaptersDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List chapters of a class' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'List of chapters' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Class not found' }),
  );
