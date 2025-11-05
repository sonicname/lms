import { Button, Flex, TextInput } from '@mantine/core';
import appEnv from 'app-env';
import AuthForm from './auth-form';

export default function SignInForm() {
  return (
    <AuthForm<{
      email: string;
      password: string;
    }>
      handleSubmit={(value) => {
        fetch(`${appEnv.apiUrl}/auth/sign-in`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        })
          .then(async (res) => {
            if (!res.ok) {
              const data = await res.json();
              throw new Error(data.message || 'Sign in failed');
            }
            return res.json();
          })
          .then((data) => {
            console.log('Sign in successful:', data);
          })
          .catch((error) => {
            console.error('Error during sign in:', error);
          });
      }}
      validate={{
        password: (value) => {
          if (value.length < 6) {
            return 'Password must be at least 6 characters long';
          }
        },
      }}
    >
      {(form) => (
        <Flex direction='column' gap='md'>
          <TextInput
            type='email'
            placeholder='Email'
            withAsterisk
            label='Email'
            autoComplete='off'
            {...form.getInputProps('email')}
          />
          <TextInput
            type='password'
            withAsterisk
            label='Password'
            {...form.getInputProps('password')}
          />

          <Flex justify='flex-end'>
            <Button type='submit'>Sign In</Button>
          </Flex>
        </Flex>
      )}
    </AuthForm>
  );
}
