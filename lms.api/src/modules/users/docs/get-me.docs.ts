import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetMeDocs = () =>
  applyDecorators(
    ApiCookieAuth('access_token'),
    ApiOperation({
      summary: 'Get current user',
      description:
        'Returns the profile of the authenticated user using the access_token cookie.',
    }),
    ApiResponse({
      status: 200,
      description: 'Current user profile',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string', nullable: true },
          image: { type: 'string', format: 'uri', nullable: true },
          role: { type: 'string', example: 'student' },
          banned: { type: 'boolean', example: false },
          banReason: { type: 'string', nullable: true },
          banExpires: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Missing or invalid access token cookie',
    }),
  );
