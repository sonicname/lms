import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const GetTestDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get a test by id (students blocked before start)',
    }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'testId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Test details' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Test not found' }),
  );
