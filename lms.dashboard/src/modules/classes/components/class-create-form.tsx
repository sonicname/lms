import { Button, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassesQueryKey } from '../constants/classes-query-key';
import type { CreateClassModel } from '../models/create-class.model';
import { classesApi } from '../services/classes.api';

export type ClassCreateFormProps = {
  onCreated?: () => Promise<void> | void;
};

export default function ClassCreateForm({ onCreated }: ClassCreateFormProps) {
  const qc = useQueryClient();
  const form = useForm<CreateClassModel>({
    initialValues: { name: '', code: '', description: '' },
    validate: {
      name: (v) =>
        !v ? 'Tên bắt buộc' : v.length > 100 ? 'Tối đa 100 ký tự' : null,
      code: (v) =>
        !v ? 'Mã lớp bắt buộc' : v.length > 20 ? 'Tối đa 20 ký tự' : null,
      description: (v) =>
        v && v.length > 500 ? 'Mô tả tối đa 500 ký tự' : null,
    },
  });

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

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        createMutation.mutate(values);
      })}
    >
      <Stack gap='md'>
        <TextInput
          label='Tên lớp'
          withAsterisk
          {...form.getInputProps('name')}
        />
        <TextInput
          label='Mã lớp'
          withAsterisk
          {...form.getInputProps('code')}
        />
        <TextInput label='Mô tả' {...form.getInputProps('description')} />
        <Group justify='flex-end'>
          <Button type='submit' loading={createMutation.status === 'pending'}>
            Tạo
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
