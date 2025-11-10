import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const CreateEssayQuestionDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Create an essay question for a test (teacher only)',
    }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'testId', required: true, type: String }),
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
    ApiResponse({ status: 201, description: 'Essay question created' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Test not found' }),
  );
