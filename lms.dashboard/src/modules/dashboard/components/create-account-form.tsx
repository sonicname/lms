import { Button, Flex, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import {
  createUser,
  type CreateUserDto,
  type User,
} from '../services/users.api.ts';

export interface CreateAccountFormProps {
  onCreated?: (user: User) => void;
}

export default function CreateAccountForm({
  onCreated,
}: CreateAccountFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateUserDto>({
    initialValues: {
      email: '',
      password: '',
      name: '',
      image: '',
      role: 'student',
    },
    validate: {
      email: (v) =>
        !v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? 'Email không hợp lệ'
          : null,
      password: (v) =>
        v && v.length >= 6 ? null : 'Mật khẩu tối thiểu 6 ký tự',
      name: (v) => (v && v.length > 50 ? 'Tên tối đa 50 ký tự' : null),
      image: (v) => (v && !/^https?:\/\//.test(v) ? 'Image phải là URL' : null),
      role: (v) =>
        v && ['admin', 'teacher', 'student'].includes(v)
          ? null
          : 'Vai trò không hợp lệ',
    },
  });

  const onSubmit = async (values: CreateUserDto) => {
    setSubmitting(true);
    try {
      const user: User = await createUser(values);
      notifications.show({
        title: 'Tạo tài khoản thành công',
        message: `Đã tạo: ${user.email}`,
        color: 'green',
      });
      // Clear form after success
      form.reset();
      onCreated?.(user);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Không thể tạo tài khoản';
      notifications.show({ title: 'Lỗi', message, color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap='md'>
        <TextInput
          label='Email'
          placeholder='name@example.com'
          withAsterisk
          {...form.getInputProps('email')}
        />
        <TextInput
          type='password'
          label='Mật khẩu'
          placeholder='••••••'
          withAsterisk
          {...form.getInputProps('password')}
        />
        <Flex gap='md'>
          <TextInput
            className='flex-1'
            label='Tên'
            placeholder='Tên hiển thị (tùy chọn)'
            {...form.getInputProps('name')}
          />
          <Select
            label='Vai trò'
            withAsterisk
            data={[
              { value: 'admin', label: 'Admin' },
              { value: 'teacher', label: 'Giáo viên' },
              { value: 'student', label: 'Học viên' },
            ]}
            {...form.getInputProps('role')}
          />
        </Flex>
        <TextInput
          label='Ảnh đại diện (URL)'
          placeholder='https://...'
          {...form.getInputProps('image')}
        />

        <Flex justify='flex-end'>
          <Button type='submit' loading={submitting}>
            Tạo tài khoản
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
