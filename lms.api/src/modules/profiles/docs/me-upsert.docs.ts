import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfileSchema } from './profile-schema';

export const MeUpsertProfileDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Upsert my profile' }),
    ApiResponse({
      status: 200,
      description: 'Upserted profile',
      schema: ProfileSchema,
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
