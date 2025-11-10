import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const ListEssayQuestionsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List essay questions of a test' }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'testId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Essay questions list' }),
  );
