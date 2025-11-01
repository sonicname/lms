import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';

export const SignUpDocs = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Sign up',
      description: 'Register a new user and return a JWT token.',
    }),
    ApiResponse({
      status: 201,
      description: 'User successfully registered',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid request',
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
          name: {
            type: 'string',
            example: 'John Doe',
            minLength: 3,
            maxLength: 50,
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
          image: {
            type: 'string',
            format: 'uri',
            example: 'http://localhost:3000/auth/callback',
          },
        },
      },
    }),
  );
};
