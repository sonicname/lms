import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ShortDeleteAnswerDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete an answer (owner/teacher/admin)' }),
    ApiParam({ name: 'answerId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Answer deleted' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Answer not found' }),
  );
