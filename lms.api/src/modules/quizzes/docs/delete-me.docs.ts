import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const DeleteMyQuizDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete my quiz' }),
    ApiResponse({ status: 200, description: 'Deleted' }),
    ApiResponse({ status: 404, description: 'Quiz not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
