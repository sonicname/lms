import {
  Button,
  Drawer,
  FileInput,
  Group,
  MultiSelect,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AssetsQueryKey } from '../constants/assets-query-key';
import type { AssetModel } from '../models/asset.model';
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

  // Tag selection state for upload
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [debouncedTagSearch] = useDebouncedValue(tagSearch, 300);
  const tagsQuery = useQuery({
    queryKey: ['assets', 'tags', { search: debouncedTagSearch }],
    queryFn: () => assetsApi.listTags(debouncedTagSearch),
  });
  const tagOptions = (tagsQuery.data || []).map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const uploadMutation = useMutation<
    AssetModel,
    unknown,
    { file: File; fileType: string; type: string }
  >({
    mutationFn: async (vars) =>
      assetsApi.upload(vars.file, {
        fileType: vars.fileType,
        type: vars.type || undefined,
      }) as Promise<AssetModel>,
    onSuccess: async (asset) => {
      // Attach tags after upload if any selected
      if (asset?.id && selectedTags.length) {
        try {
          await assetsApi.attachTags(asset.id, selectedTags);
        } catch {
          // best-effort; notify but continue
          notifications.show({
            color: 'yellow',
            message: 'Tải lên thành công nhưng gán tag thất bại',
          });
        }
      }
      notifications.show({
        title: 'Tải lên thành công',
        message: 'File đã được lưu',
        color: 'green',
      });
      await qc.invalidateQueries({ queryKey: AssetsQueryKey.lists() });
      if (onUploaded) await onUploaded();
      form.reset();
      setSelectedTags([]);
      setTagSearch('');
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
          <MultiSelect
            label='Tag (tuỳ chọn)'
            data={tagOptions}
            value={selectedTags}
            onChange={setSelectedTags}
            searchable
            searchValue={tagSearch}
            onSearchChange={setTagSearch}
            nothingFoundMessage={
              tagsQuery.isFetching ? 'Đang tải...' : 'Không có tag'
            }
            placeholder='Chọn tag để gán sau khi tải lên'
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
