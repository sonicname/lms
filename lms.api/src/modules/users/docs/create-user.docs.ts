import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export const CreateUserDocs = () =>
  applyDecorators(
    ApiCookieAuth('access_token'),
    ApiOperation({ summary: 'Create user (admin)' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string', nullable: true },
          image: { type: 'string', format: 'uri', nullable: true },
          role: {
            type: 'string',
            enum: ['admin', 'teacher', 'student'],
            nullable: true,
          },
        },
        required: ['email', 'password'],
      },
    }),
    ApiResponse({ status: 201, description: 'User created' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' }),
    ApiResponse({
      status: 409,
      description: 'Conflict - Email already exists',
    }),
  );
