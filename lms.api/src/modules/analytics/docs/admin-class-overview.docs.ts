import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const AdminClassOverviewDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Admin class overview analytics' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Class analytics returned' }),
  );
