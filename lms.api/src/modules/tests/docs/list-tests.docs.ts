import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ListTestsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'List tests in a class (students see only opened ones)',
    }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'List of tests' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Class not found' }),
  );
