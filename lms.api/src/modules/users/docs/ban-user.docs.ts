import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export const BanUserDocs = () =>
  applyDecorators(
    ApiCookieAuth('access_token'),
    ApiOperation({ summary: 'Ban user (admin)' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
          until: {
            type: 'string',
            format: 'date-time',
            description:
              'ISO date when ban expires (optional for permanent ban)',
          },
        },
        required: ['reason'],
      },
    }),
    ApiResponse({ status: 200, description: 'User banned' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
