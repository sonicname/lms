import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function AttachLessonAssetsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Attach assets to a lesson' }),
    ApiResponse({ status: 201, description: 'Assets attached' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
}
