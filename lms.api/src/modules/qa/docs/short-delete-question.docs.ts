import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ShortDeleteQuestionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a question (owner/teacher/admin)' }),
    ApiParam({ name: 'questionId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Question deleted' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Question not found' }),
  );
