import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ShortListAnswersDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List answers for a question' }),
    ApiParam({ name: 'questionId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'List of answers' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Question not found' }),
  );
