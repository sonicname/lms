import {
  Button,
  Drawer,
  FileInput,
  Group,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AssetsQueryKey } from '../constants/assets-query-key';
import { assetsApi } from '../services/assets.api';

export type AssetUploadDrawerProps = {
  opened: boolean;
  onClose: () => void;
  onUploaded?: () => Promise<void> | void;
};

export default function AssetUploadDrawer({
  opened,
  onClose,
  onUploaded,
}: AssetUploadDrawerProps) {
  const qc = useQueryClient();
  const form = useForm<{ file: File | null; fileType: string; type: string }>({
    initialValues: { file: null, fileType: 'file', type: '' },
    validate: {
      file: (v) => (!v ? 'File bắt buộc' : null),
      fileType: (v) => (!v ? 'Loại file bắt buộc' : null),
      type: (v) => (v && v.length > 50 ? 'Tối đa 50 ký tự' : null),
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (vars: { file: File; fileType: string; type: string }) =>
      assetsApi.upload(vars.file, {
        fileType: vars.fileType,
        type: vars.type || undefined,
      }),
    onSuccess: async () => {
      notifications.show({
        title: 'Tải lên thành công',
        message: 'File đã được lưu',
        color: 'green',
      });
      await qc.invalidateQueries({ queryKey: AssetsQueryKey.lists() });
      if (onUploaded) await onUploaded();
      form.reset();
      onClose();
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Không thể tải lên';
      notifications.show({ title: 'Lỗi', message, color: 'red' });
    },
  });

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title='Tải lên nội dung'
      position='right'
      size='md'
    >
      <form
        onSubmit={form.onSubmit((values) => {
          if (!values.file) return;
          uploadMutation.mutate({
            file: values.file,
            fileType: values.fileType,
            type: values.type,
          });
        })}
      >
        <Stack gap='md'>
          <FileInput
            label='File'
            placeholder='Chọn file'
            withAsterisk
            {...form.getInputProps('file')}
          />
          <Select
            label='Loại file'
            withAsterisk
            data={[
              { value: 'image', label: 'Image' },
              { value: 'video', label: 'Video' },
              { value: 'file', label: 'File' },
            ]}
            {...form.getInputProps('fileType')}
          />
          <TextInput
            label='Phân loại (type)'
            placeholder='avatar, lesson-material...'
            {...form.getInputProps('type')}
          />
          <Group justify='flex-end'>
            <Button variant='default' onClick={onClose} type='button'>
              Huỷ
            </Button>
            <Button type='submit' loading={uploadMutation.status === 'pending'}>
              Tải lên
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
