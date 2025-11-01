import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const UnbanUserDocs = () =>
  applyDecorators(
    ApiCookieAuth('access_token'),
    ApiOperation({ summary: 'Unban user (admin)' }),
    ApiResponse({ status: 200, description: 'User unbanned' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden - Insufficient role' }),
    ApiResponse({ status: 404, description: 'User not found' }),
  );
