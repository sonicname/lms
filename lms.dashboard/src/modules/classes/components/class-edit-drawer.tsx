import {
  Button,
  Drawer,
  Group,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import AssetUploadDrawer from '../../assets/components/asset-upload-drawer';
import AssetsMultiPicker from '../../assets/components/assets-multi-picker';
import { AssetsQueryKey } from '../../assets/constants/assets-query-key';
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
  const qc = useQueryClient();
  const [uploadOpened, uploadCtrl] = useDisclosure(false);
  const form = useForm<UpdateClassModel>({
    initialValues: {
      name: '',
      code: '',
      description: '',
      tags: [],
      banners: [],
    },
    validate: {
      name: (v) => (v && v.length > 100 ? 'Tối đa 100 ký tự' : null),
      code: (v) => (v && v.length > 32 ? 'Tối đa 32 ký tự' : null),
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
    const existingBanners = (detailQuery.data?.banners ?? []).map(
      (b: { id: string }) => b.id,
    );
    const next: UpdateClassModel = {
      name: classData.name ?? '',
      code: classData.code ?? '',
      description: classData.description ?? '',
      tags: existingTags,
      banners: existingBanners,
    };
    const curr = form.getValues();
    if (
      (curr.name ?? '') !== next.name ||
      (curr.code ?? '') !== next.code ||
      (curr.description ?? '') !== (next.description ?? '') ||
      JSON.stringify(curr.tags ?? []) !== JSON.stringify(next.tags ?? []) ||
      JSON.stringify(curr.banners ?? []) !== JSON.stringify(next.banners ?? [])
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
          <Textarea
            rows={10}
            label='Mô tả'
            {...form.getInputProps('description')}
          />
          <TagsInput
            label='Tags'
            placeholder='Nhập để thêm, Enter để tạo'
            value={form.values.tags ?? []}
            onChange={(vals) => form.setFieldValue('tags', vals)}
          />
          <Stack gap='xs'>
            <Group justify='space-between'>
              <Text size='sm' fw={500}>
                Banners
              </Text>
              <Button
                size='xs'
                variant='subtle'
                onClick={uploadCtrl.open}
                type='button'
              >
                Tải ảnh mới
              </Button>
            </Group>
            <AssetsMultiPicker
              value={form.values.banners ?? []}
              onChange={(ids) => form.setFieldValue('banners', ids)}
              searchPlaceholder='Tìm ảnh...'
              listEmptyLabel='Không có ảnh'
              extraFilters={{ fileType: 'image' }}
            />
            {/* Ordering removed: banners relation now many-to-many without explicit order */}
          </Stack>
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
      <AssetUploadDrawer
        opened={uploadOpened}
        onClose={uploadCtrl.close}
        onUploaded={async () => {
          await qc.invalidateQueries({ queryKey: ['assets', 'picker'] });
          await qc.invalidateQueries({ queryKey: AssetsQueryKey.lists() });
        }}
      />
    </Drawer>
  );
}
