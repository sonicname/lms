import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const RefreshTokenDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh token',
      description:
        'Rotate refresh token and issue a new access token. If body.refreshToken is omitted, the refresh token is read from the refresh_token cookie.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          refreshToken: {
            type: 'string',
            example: 'def50200e3f...',
          },
        },
        required: [],
      },
      required: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Successful refresh',
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string', nullable: true },
              image: { type: 'string', format: 'uri', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          tokens: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              accessTokenExpiresIn: { type: 'number' },
              refreshToken: { type: 'string' },
              refreshTokenExpiresAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Missing or invalid refresh token',
    }),
  );
};
