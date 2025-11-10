import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const UpdateEssayQuestionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update an essay question (teacher only)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'testId', required: true, type: String }),
    ApiParam({ name: 'questionId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', nullable: true },
          displayOrder: { type: 'number', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Essay question updated' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Essay question not found' }),
  );
