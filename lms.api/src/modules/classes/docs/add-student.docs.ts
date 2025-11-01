import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const AddStudentDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Add a student to a class (admin or owning teacher)',
    }),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          studentId: { type: 'string' },
        },
        required: ['studentId'],
      },
    }),
    ApiResponse({ status: 200, description: 'Student enrolled (approved)' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Not Found' }),
    ApiResponse({ status: 409, description: 'Already enrolled' }),
  );
