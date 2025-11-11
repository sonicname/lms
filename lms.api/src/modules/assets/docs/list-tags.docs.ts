import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ListAssetTagsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'List asset tags (scoped to user unless admin)' }),
    ApiResponse({ status: 200, description: 'OK' }),
  );
}
