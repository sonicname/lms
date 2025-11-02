import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const AttachTestAssetsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Attach assets to a test (teacher only)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'testId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          assetIds: { type: 'array', items: { type: 'string' } },
        },
        required: ['assetIds'],
      },
    }),
    ApiResponse({ status: 200, description: 'Assets attached' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Test not found' }),
  );
