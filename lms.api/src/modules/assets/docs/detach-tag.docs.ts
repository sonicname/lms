import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DetachAssetTagDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Detach one tag from an asset' }),
    ApiResponse({ status: 200, description: 'OK' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Asset or tag not found' }),
  );
}
