import { Autocomplete, Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { UsersQueryKey } from '../../accounts/constants/users-query-key';
import type { UserModel } from '../../accounts/models/user.model';
import { accountApi } from '../../accounts/services/account.api';
import { useAuthStore } from '../../auth/stores/auth-store';
import { ClassesQueryKey } from '../constants/classes-query-key';
import type { CreateClassModel } from '../models/create-class.model';
import { classesApi } from '../services/classes.api';

export type ClassCreateFormProps = {
  onCreated?: () => Promise<void> | void;
};

export default function ClassCreateForm({ onCreated }: ClassCreateFormProps) {
  const qc = useQueryClient();
  const { getCurrentUserRole, user } = useAuthStore();

  const currentUserRole = getCurrentUserRole();
  const currentUserId = user?.id;

  const form = useForm<CreateClassModel>({
    initialValues: {
      name: '',
      code: '',
      description: '',
      teacherId: undefined,
    },
    validate: {
      name: (v) =>
        !v ? 'Tên bắt buộc' : v.length > 100 ? 'Tối đa 100 ký tự' : null,
      code: (v) =>
        !v ? 'Mã lớp bắt buộc' : v.length > 20 ? 'Tối đa 20 ký tự' : null,
      description: (v) =>
        v && v.length > 500 ? 'Mô tả tối đa 500 ký tự' : null,
    },
  });

  // Teacher autocomplete
  const [teacherText, setTeacherText] = useState('');
  const [debouncedTeacher] = useDebouncedValue(teacherText, 300);

  const teachersQuery = useQuery({
    queryKey: [
      ...UsersQueryKey.lists(),
      { role: 'teacher', search: debouncedTeacher },
    ],
    queryFn: async () =>
      accountApi.listUsers({
        role: 'teacher',
        search: debouncedTeacher,
        limit: 10,
      }),
    enabled: currentUserRole === 'admin',
  });

  const teacherList = (teachersQuery.data?.data ?? []) as UserModel[];
  const teacherOptions = teacherList.map((u) => ({
    label: u.name ? `${u.name} (${u.email})` : u.email,
    id: u.id,
  }));

  const createMutation = useMutation({
    mutationFn: async (payload: CreateClassModel) => classesApi.create(payload),
    onSuccess: async () => {
      notifications.show({
        title: 'Tạo lớp thành công',
        message: 'Lớp đã được tạo',
        color: 'green',
      });
      await qc.invalidateQueries({ queryKey: ClassesQueryKey.lists() });
      if (onCreated) await onCreated();
      form.reset();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Không thể tạo lớp';
      notifications.show({ title: 'Lỗi', message, color: 'red' });
    },
  });

  useEffect(() => {
    if (currentUserRole === 'admin') return;

    form.setFieldValue('teacherId', currentUserId);
  }, [currentUserRole, currentUserId]);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        createMutation.mutate(values);
      })}
    >
      <Stack gap='md'>
        <TextInput
          label='Tên lớp'
          placeholder='Nhập tên lớp'
          withAsterisk
          {...form.getInputProps('name')}
        />
        <TextInput
          label='Mã lớp'
          placeholder='Nhập mã lớp'
          withAsterisk
          {...form.getInputProps('code')}
        />
        <TextInput
          label='Mô tả'
          placeholder='Nhập mô tả'
          {...form.getInputProps('description')}
        />
        {currentUserRole === 'admin' ? (
          <Autocomplete
            label='Giáo viên'
            placeholder='Nhập tên hoặc email giáo viên'
            data={teacherOptions.map((o) => o.label)}
            value={teacherText}
            onChange={(val) => {
              setTeacherText(val);
              const match = teacherOptions.find((o) => o.label === val);
              form.setFieldValue('teacherId', match?.id);
            }}
            onOptionSubmit={(val) => {
              setTeacherText(val);
              const match = teacherOptions.find((o) => o.label === val);
              form.setFieldValue('teacherId', match?.id);
            }}
            rightSection={
              teachersQuery.isLoading ? (
                <span style={{ fontSize: 12 }}>Đang tìm...</span>
              ) : undefined
            }
          />
        ) : null}
        <Group justify='flex-end'>
          <Button type='submit' loading={createMutation.status === 'pending'}>
            Tạo
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
