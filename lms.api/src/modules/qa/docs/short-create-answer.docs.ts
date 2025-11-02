import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ShortCreateAnswerDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create an answer for a question' }),
    ApiParam({ name: 'questionId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: { content: { type: 'string' } },
        required: ['content'],
      },
    }),
    ApiResponse({ status: 201, description: 'Answer created' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Question not found' }),
  );
