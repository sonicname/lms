import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export const DeleteAnswerDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Delete an answer (owner or class teacher/admin)',
    }),
    ApiParam({ name: 'classId', required: true, type: String }),
    ApiParam({ name: 'chapterId', required: true, type: String }),
    ApiParam({ name: 'lessonId', required: true, type: String }),
    ApiParam({ name: 'questionId', required: true, type: String }),
    ApiParam({ name: 'answerId', required: true, type: String }),
    ApiResponse({ status: 200, description: 'Answer deleted' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Answer not found' }),
  );
