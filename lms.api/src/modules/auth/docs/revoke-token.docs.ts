import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const RevokeTokenDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Revoke token (sign out)',
      description:
        'Invalidate the current refresh token and clear auth cookies. If body.refreshToken is omitted, the refresh token is read from the refresh_token cookie.',
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
      description: 'Revoked successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Missing refresh token',
    }),
  );
};
