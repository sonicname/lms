import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const SubmitMcqAnswersDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Submit MCQ answers (student)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'testId', required: true, type: String }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          answers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                quizId: { type: 'string' },
                choiceId: { type: 'string', nullable: true },
              },
              required: ['quizId'],
            },
          },
        },
        required: ['answers'],
      },
    }),
    ApiResponse({ status: 200, description: 'Submission updated and scored' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not found' }),
  );
