import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const AdminPingDocs = () =>
  applyDecorators(
    ApiCookieAuth('access_token'),
    ApiOperation({
      summary: 'Admin ping',
      description: 'Admin-only sample endpoint to validate role guard.',
    }),
    ApiResponse({
      status: 200,
      description: 'OK',
      schema: {
        type: 'object',
        properties: { ok: { type: 'boolean', example: true } },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' }),
  );
