import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const AdminEngagementDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin engagement metrics (date-range)' }),
    ApiQuery({ name: 'from', required: false, description: 'ISO start date' }),
    ApiQuery({ name: 'to', required: false, description: 'ISO end date' }),
    ApiResponse({ status: 200, description: 'Engagement metrics returned' }),
  );
