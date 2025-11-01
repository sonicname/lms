import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const SignInDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Sign in',
      description: 'Authenticate a user and return a JWT token.',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'yourpassword',
            minLength: 6,
          },
          callbackURL: {
            type: 'string',
            format: 'uri',
            example: 'http://localhost:3000/auth/callback',
          },
          rememberMe: {
            type: 'boolean',
            example: true,
            description: 'Whether to remember the user on this device.',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Successful sign-in',
      schema: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string', nullable: true },
              image: { type: 'string', format: 'uri', nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          tokens: {
            type: 'object',
            properties: {
              accessToken: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              accessTokenExpiresIn: { type: 'number', example: 900 },
              refreshToken: {
                type: 'string',
                example: 'def50200e3f...',
              },
              refreshTokenExpiresAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid credentials',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Invalid email or password',
          },
        },
      },
    }),
  );
};
