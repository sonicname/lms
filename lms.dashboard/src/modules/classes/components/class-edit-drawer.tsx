import { Button, Drawer, Group, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import type { UpdateClassModel } from '../models/update-class.model';

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
    initialValues: { name: '', code: '', description: '' },
    validate: {
      name: (v) => (v && v.length > 100 ? 'Tối đa 100 ký tự' : null),
      code: (v) => (v && v.length > 20 ? 'Tối đa 20 ký tự' : null),
      description: (v) =>
        v && (v as string).length > 500 ? 'Mô tả tối đa 500 ký tự' : null,
    },
  });

  useEffect(() => {
    if (classData) {
      form.setValues({
        name: classData.name ?? '',
        code: classData.code ?? '',
        description: classData.description ?? '',
      });
    }
  }, [classData, form]);

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
