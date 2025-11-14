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
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { signIn } from '~/modules/auth/services/auth.api';

export default function SignInPage() {
  const navigate = useNavigate();

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

  const mutation = useMutation({
    mutationFn: async (values: typeof form.values) =>
      signIn(
        {
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        },
        () => {
          navigate('/');
        },
      ),
  });

  const onSubmit = form.onSubmit((values) => mutation.mutate(values));

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
              <Button type='submit' loading={mutation.isPending}>
                Sign In
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
