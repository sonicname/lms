import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const UpdateChapterDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a chapter (teacher of class only)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'chapterId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', nullable: true },
          content: { type: 'string', nullable: true },
          displayOrder: { type: 'number', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Chapter updated' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Chapter not found' }),
  );
