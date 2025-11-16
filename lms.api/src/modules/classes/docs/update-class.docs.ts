import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const UpdateClassDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update class (admin or owning teacher)' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          code: { type: 'string', minLength: 3, maxLength: 32 },
          teacherId: { type: 'string', description: 'Admin only' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Optional list of tag names to replace the class tags (owned by the teacher)',
          },
          banners: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Optional list of asset IDs to replace class banners (images)',
          },
        },
        required: [],
      },
    }),
    ApiResponse({ status: 200, description: 'Class updated' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
    ApiResponse({ status: 409, description: 'Conflict - code already exists' }),
  );
