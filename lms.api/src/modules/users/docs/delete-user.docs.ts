import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const DeleteUserDocs = () =>
  applyDecorators(
    ApiCookieAuth('access_token'),
    ApiOperation({ summary: 'Delete user (admin)' }),
    ApiResponse({ status: 200, description: 'User deleted' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
