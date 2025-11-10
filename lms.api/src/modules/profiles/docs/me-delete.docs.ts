import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const MeDeleteProfileDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete my profile' }),
    ApiResponse({ status: 200, description: 'Deleted' }),
    ApiResponse({ status: 404, description: 'Profile not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
