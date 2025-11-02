import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ShortUpdateQuestionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a question (owner/teacher/admin)' }),
    ApiParam({ name: 'questionId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          title: { type: 'string', nullable: true },
          content: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Question updated' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Question not found' }),
  );
