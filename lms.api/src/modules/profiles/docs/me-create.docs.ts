import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfileSchema } from './profile-schema';

export const MeCreateProfileDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create my profile' }),
    ApiResponse({ status: 201, description: 'Created', schema: ProfileSchema }),
    ApiResponse({ status: 409, description: 'Profile already exists' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
