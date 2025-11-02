import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const AdminOverviewDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin analytics overview' }),
    ApiResponse({ status: 200, description: 'Overview metrics returned' }),
  );
