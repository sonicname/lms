import { Button, Flex, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { LuAtSign, LuEye, LuEyeClosed, LuLock } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { signIn, type AuthResponse } from '../services/auth.api.ts';
import AuthForm from './auth-form';

export default function SignInForm() {
  const [seePassword, setSeePassword] = useState(false);
  const navigate = useNavigate();

  return (
    <AuthForm<{
      email: string;
      password: string;
    }>
      handleSubmit={async (value) => {
        try {
          const data: AuthResponse = await signIn({
            email: value.email,
            password: value.password,
            rememberMe: true,
          });
          // At this point, cookies and access token mirror are set. Navigate in.
          console.log('Sign in successful:', data?.user?.email);
          navigate('/');
        } catch (error) {
          console.error('Error during sign in:', error);

          notifications.show({
            title: 'Sign in failed',
            message: 'Please check your credentials and try again.',
            color: 'red',
          });
        }
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
          <div className='flex justify-center'>
            <p className='font-semibold text-lg'>LMS Admin Portal</p>
          </div>

          <TextInput
            type='email'
            placeholder='Email'
            withAsterisk
            label='Email'
            leftSection={<LuAtSign />}
            {...form.getInputProps('email')}
          />
          <TextInput
            type={seePassword ? 'text' : 'password'}
            withAsterisk
            label='Mật khẩu'
            placeholder='Mật khẩu...'
            leftSection={<LuLock />}
            rightSection={
              seePassword ? (
                <LuEyeClosed
                  className='cursor-pointer'
                  onClick={() => setSeePassword(!seePassword)}
                />
              ) : (
                <LuEye
                  className='cursor-pointer'
                  onClick={() => setSeePassword(!seePassword)}
                />
              )
            }
            {...form.getInputProps('password')}
          />

          <Flex justify='flex-end'>
            <Button type='submit'>Đăng Nhập</Button>
          </Flex>
        </Flex>
      )}
    </AuthForm>
  );
}
