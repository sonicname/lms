import {
  Button,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import React from 'react';
import { useNavigate } from 'react-router';
import { signIn } from '~/core/api/client';
import { useTokenStore } from '~/core/api/token-manager';

export default function SignInPage() {
  const navigate = useNavigate();
  const setTokens = useTokenStore((s) => s.setTokens);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validate: {
      email: (value) =>
        /.+@.+\..+/.test(value) ? null : 'Please enter a valid email',
      password: (value) =>
        value.length >= 6 ? null : 'Password must be at least 6 characters',
    },
  });

  const [submitting, setSubmitting] = React.useState(false);

  const onSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    try {
      const res = await signIn({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      setTokens({
        accessToken: res.tokens.accessToken,
        refreshToken: res.tokens.refreshToken,
      });

      notifications.show({
        color: 'green',
        title: 'Signed in',
        message: 'Welcome back!',
      });

      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password';
      notifications.show({
        color: 'red',
        title: 'Sign-in failed',
        message: msg,
      });
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Paper maw={420} mx='auto' mt='xl' p='lg' withBorder>
      <Stack>
        <div>
          <Title order={3}>Student Sign In</Title>
          <Text c='dimmed' size='sm'>
            Use your account to access the study ground
          </Text>
        </div>

        <form onSubmit={onSubmit}>
          <Stack>
            <TextInput
              label='Email'
              placeholder='you@example.com'
              withAsterisk
              autoComplete='email'
              key={form.key('email')}
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label='Password'
              placeholder='Your password'
              withAsterisk
              autoComplete='current-password'
              key={form.key('password')}
              {...form.getInputProps('password')}
            />

            <Checkbox
              label='Remember me'
              key={form.key('rememberMe')}
              {...form.getInputProps('rememberMe', { type: 'checkbox' })}
            />

            <Group justify='flex-end'>
              <Button type='submit' loading={submitting}>
                Sign In
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
