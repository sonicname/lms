import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChoiceSchema } from './schemas';

export const ListChoicesDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List choices for my quiz' }),
    ApiResponse({
      status: 200,
      description: 'Array of choices',
      schema: { type: 'array', items: ChoiceSchema },
    }),
    ApiResponse({ status: 404, description: 'Quiz not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const CreateChoiceDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create choice for my quiz' }),
    ApiResponse({
      status: 201,
      description: 'Created choice',
      schema: ChoiceSchema,
    }),
    ApiResponse({ status: 404, description: 'Quiz not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const UpdateChoiceDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update choice for my quiz' }),
    ApiResponse({
      status: 200,
      description: 'Updated choice',
      schema: ChoiceSchema,
    }),
    ApiResponse({ status: 404, description: 'Quiz or choice not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );

export const DeleteChoiceDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete choice for my quiz' }),
    ApiResponse({ status: 200, description: 'Deleted' }),
    ApiResponse({ status: 404, description: 'Quiz or choice not found' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
