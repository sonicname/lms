import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const SubmitTestDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Submit or update a test submission (student)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'testId', required: true, type: String }),
    ApiBody({
      required: false,
      schema: {
        type: 'object',
        properties: {
          assetIds: {
            type: 'array',
            items: { type: 'string' },
            nullable: true,
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Submission created/updated' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Test not found' }),
  );
