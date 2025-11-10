import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfileSchema } from './profile-schema';

export const MeUpdateProfileDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update my profile' }),
    ApiResponse({
      status: 200,
      description: 'Updated profile',
      schema: ProfileSchema,
    }),
    ApiResponse({ status: 404, description: 'Profile not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
