import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ShortGetQuestionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a question' }),
    ApiParam({ name: 'questionId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Question details' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Question not found' }),
  );
