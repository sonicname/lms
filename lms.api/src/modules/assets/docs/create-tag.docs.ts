import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function CreateAssetTagDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create an asset tag (unique per user)' }),
    ApiResponse({ status: 201, description: 'Created' }),
    ApiResponse({ status: 409, description: 'Duplicate tag name for user' }),
  );
}
