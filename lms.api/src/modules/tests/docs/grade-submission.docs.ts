import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const GradeSubmissionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Grade a submission (teacher)' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'testId', required: true, type: String }),
    ApiParam({ name: 'submissionId', required: true, type: String }),
    ApiBody({
      required: false,
      schema: {
        type: 'object',
        properties: {
          score: { type: 'number', nullable: true },
          feedback: { type: 'string', nullable: true },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Submission graded' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Submission or test not found' }),
  );
