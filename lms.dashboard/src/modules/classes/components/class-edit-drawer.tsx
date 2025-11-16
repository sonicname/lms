import {
  Button,
  Drawer,
  Group,
  Stack,
  TagsInput,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ClassesQueryKey } from '../constants/classes-query-key';
import type { UpdateClassModel } from '../models/update-class.model';
import { classesApi } from '../services/classes.api';

export type ClassEditDrawerProps = {
  opened: boolean;
  onClose: () => void;
  loading?: boolean;
  classData: {
    id: string;
    name: string;
    code: string;
    description: string | null;
  } | null;
  onSubmit: (values: UpdateClassModel) => void;
};

export default function ClassEditDrawer({
  opened,
  onClose,
  loading,
  classData,
  onSubmit,
}: ClassEditDrawerProps) {
  const form = useForm<UpdateClassModel>({
    initialValues: { name: '', code: '', description: '', tags: [] },
    validate: {
      name: (v) => (v && v.length > 100 ? 'Tối đa 100 ký tự' : null),
      code: (v) => (v && v.length > 20 ? 'Tối đa 20 ký tự' : null),
      description: (v) =>
        v && (v as string).length > 500 ? 'Mô tả tối đa 500 ký tự' : null,
    },
  });

  // Load class detail (for existing tags) when opening
  const detailQuery = useQuery({
    queryKey: ClassesQueryKey.detail(classData?.id ?? ''),
    queryFn: async () => classesApi.getOne(classData!.id),
    enabled: !!classData?.id,
  });

  useEffect(() => {
    if (!classData) return;
    const existingTags = detailQuery.data?.tags?.map((t) => t.name) ?? [];
    const next: UpdateClassModel = {
      name: classData.name ?? '',
      code: classData.code ?? '',
      description: classData.description ?? '',
      tags: existingTags,
    };
    const curr = form.getValues();
    if (
      (curr.name ?? '') !== next.name ||
      (curr.code ?? '') !== next.code ||
      (curr.description ?? '') !== (next.description ?? '') ||
      JSON.stringify(curr.tags ?? []) !== JSON.stringify(next.tags ?? [])
    ) {
      form.setValues(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData, detailQuery.data]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title='Chỉnh sửa lớp học'
      position='right'
      size='md'
    >
      <form
        onSubmit={form.onSubmit((values) => {
          if (!classData) return;
          onSubmit(values);
        })}
      >
        <Stack gap='md'>
          <TextInput label='Tên lớp' {...form.getInputProps('name')} />
          <TextInput label='Mã lớp' {...form.getInputProps('code')} />
          <TextInput label='Mô tả' {...form.getInputProps('description')} />
          <TagsInput
            label='Tags'
            placeholder='Nhập để thêm, Enter để tạo'
            value={form.values.tags ?? []}
            onChange={(vals) => form.setFieldValue('tags', vals)}
          />
          <Group justify='flex-end'>
            <Button variant='default' onClick={onClose} type='button'>
              Huỷ
            </Button>
            <Button type='submit' loading={!!loading}>
              Lưu
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
