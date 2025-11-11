import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeleteAssetTagDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete an asset tag' }),
    ApiResponse({ status: 200, description: 'OK' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
}
