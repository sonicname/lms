import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

export const UploadAssetDocs = () =>
  applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiOperation({ summary: 'Upload a file' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: { type: 'string', format: 'binary' },
          fileType: { type: 'string', example: 'image' },
          type: { type: 'string', example: 'lesson-material' },
        },
        required: ['file'],
      },
    }),
    ApiResponse({
      status: 201,
      description: 'File uploaded',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          fileType: { type: 'string' },
          filename: { type: 'string' },
          mimetype: { type: 'string' },
          fileSize: { type: 'number' },
          url: { type: 'string' },
          type: { type: 'string', nullable: true },
          userId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Bad Request' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
