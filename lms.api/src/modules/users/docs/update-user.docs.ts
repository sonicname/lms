import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export const UpdateUserDocs = () =>
  applyDecorators(
    ApiCookieAuth('access_token'),
    ApiOperation({ summary: 'Update user (admin)' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string' },
          image: { type: 'string', format: 'uri' },
          role: { type: 'string', enum: ['admin', 'teacher', 'student'] },
        },
        required: [],
      },
    }),
    ApiResponse({ status: 200, description: 'User updated' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
