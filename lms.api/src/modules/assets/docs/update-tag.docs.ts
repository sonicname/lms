import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function UpdateAssetTagDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update an asset tag name' }),
    ApiResponse({ status: 200, description: 'OK' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not found' }),
    ApiResponse({ status: 409, description: 'Duplicate tag name for user' }),
  );
}
