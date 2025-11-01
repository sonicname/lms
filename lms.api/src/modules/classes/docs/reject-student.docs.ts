import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const RejectStudentDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: "Reject a student's join request (admin or owning teacher)",
    }),
    ApiResponse({ status: 200, description: 'Join request rejected' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 403, description: 'Forbidden' }),
    ApiResponse({ status: 404, description: 'Enrollment not found' }),
    ApiResponse({
      status: 409,
      description: 'Already approved; use kick instead',
    }),
  );
