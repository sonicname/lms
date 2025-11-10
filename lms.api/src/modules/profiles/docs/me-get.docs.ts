import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfileSchema } from './profile-schema';

export const MeGetProfileDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get my profile' }),
    ApiResponse({
      status: 200,
      description: 'Profile (or null if not created yet)',
      schema: { oneOf: [ProfileSchema, { type: 'null' }] },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
