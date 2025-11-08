import { Button, Drawer, Group, Select, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import type { UserModel } from '../models/user.model';

export type EditValues = {
  email: string;
  name: string;
  image: string;
  role: 'admin' | 'teacher' | 'student';
};

export type AccountEditDrawerProps = {
  opened: boolean;
  user: Pick<UserModel, 'id' | 'email' | 'name' | 'image' | 'role'> | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: EditValues) => void;
};

export default function AccountEditDrawer({
  opened,
  user,
  loading,
  onClose,
  onSubmit,
}: AccountEditDrawerProps) {
  const form = useForm<EditValues>({
    initialValues: { email: '', name: '', image: '', role: 'student' },
    validate: {
      email: (v) =>
        !v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? 'Email không hợp lệ'
          : null,
      name: (v) => (v && v.length > 50 ? 'Tên tối đa 50 ký tự' : null),
      image: (v) => (v && !/^https?:\/\//.test(v) ? 'Image phải là URL' : null),
      role: (v) =>
        v && ['admin', 'teacher', 'student'].includes(v)
          ? null
          : 'Vai trò không hợp lệ',
    },
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        email: user.email || '',
        name: user.name || '',
        image: user.image || '',
        role: ['admin', 'teacher', 'student'].includes(user.role)
          ? (user.role as 'admin' | 'teacher' | 'student')
          : 'student',
      });
    }
  }, [user, form]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title='Chỉnh sửa tài khoản'
      position='right'
      size='md'
    >
      <form
        onSubmit={form.onSubmit((values) => {
          if (!user?.id) return;
          onSubmit(values);
        })}
      >
        <Group gap='md' grow>
          <TextInput
            label='Email'
            placeholder='name@example.com'
            withAsterisk
            {...form.getInputProps('email')}
          />
          <TextInput
            label='Tên'
            placeholder='Tên hiển thị'
            {...form.getInputProps('name')}
          />
        </Group>
        <Group gap='md' grow mt='md'>
          <TextInput
            label='Ảnh (URL)'
            placeholder='https://...'
            {...form.getInputProps('image')}
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
        </Group>
        <Group justify='flex-end' mt='lg'>
          <Button variant='default' onClick={onClose} type='button'>
            Huỷ
          </Button>
          <Button type='submit' loading={loading}>
            Lưu
          </Button>
        </Group>
      </form>
    </Drawer>
  );
}
