import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const CreateChapterDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a chapter (teacher of class only)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string', nullable: true },
          displayOrder: { type: 'number', nullable: true },
        },
        required: ['title'],
      },
    }),
    ApiResponse({ status: 201, description: 'Chapter created' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Class not found' }),
  );
