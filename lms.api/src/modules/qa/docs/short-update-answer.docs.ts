import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ShortUpdateAnswerDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update an answer (owner/teacher/admin)' }),
    ApiParam({ name: 'answerId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: { content: { type: 'string', nullable: true } },
      },
    }),
    ApiResponse({ status: 200, description: 'Answer updated' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Answer not found' }),
  );
