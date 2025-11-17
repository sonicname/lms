import {
  Autocomplete,
  Button,
  Group,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { UsersQueryKey } from '../../accounts/constants/users-query-key';
import type { UserModel } from '../../accounts/models/user.model';
import { accountApi } from '../../accounts/services/account.api';
import AssetUploadDrawer from '../../assets/components/asset-upload-drawer';
import AssetsMultiPicker from '../../assets/components/assets-multi-picker';
import { AssetsQueryKey } from '../../assets/constants/assets-query-key';
import { useAuthStore } from '../../auth/stores/auth-store';
import { ClassesQueryKey } from '../constants/classes-query-key';
import type { CreateClassModel } from '../models/create-class.model';
import type { TagModel } from '../models/tag.model';
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
      code: `${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      description: '',
      teacherId: undefined,
      tags: [],
      banners: [],
    },
    validate: {
      name: (v) =>
        !v ? 'Tên bắt buộc' : v.length > 100 ? 'Tối đa 100 ký tự' : null,
      code: (v) =>
        !v ? 'Mã lớp bắt buộc' : v.length > 32 ? 'Tối đa 32 ký tự' : null,
      description: (v) =>
        v && v.length > 2000 ? 'Mô tả tối đa 2000 ký tự' : null,
    },
  });

  // Teacher autocomplete
  const [uploadOpened, uploadCtrl] = useDisclosure(false);
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

  // Tags suggestions (fetch top tags, allow free typing)
  const [localTagOptions, setLocalTagOptions] = useState<string[]>([]);
  const tagsQuery = useQuery({
    queryKey: ClassesQueryKey.tags({ search: '' }),
    queryFn: async () => classesApi.listTags({ limit: 20 }),
  });
  const tagOptions = ((tagsQuery.data?.data ?? []) as TagModel[]).map(
    (t) => t.name,
  );
  const mergedTagOptions = Array.from(
    new Set([...tagOptions, ...localTagOptions]),
  );

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
  }, [currentUserRole, currentUserId, form]);

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
        <Textarea
          rows={10}
          label='Mô tả'
          placeholder='Nhập mô tả'
          {...form.getInputProps('description')}
        />
        <TagsInput
          label='Tags'
          placeholder='Nhập để thêm, Enter để tạo'
          data={mergedTagOptions}
          value={form.values.tags ?? []}
          onChange={(vals) => form.setFieldValue('tags', vals)}
          onOptionSubmit={(val) => {
            // When selecting a suggestion ensure it's in local options for future sessions
            setLocalTagOptions((prev) =>
              prev.includes(val) ? prev : [...prev, val],
            );
          }}
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
          {/* Ordering removed: banners are now many-to-many without explicit order */}
        </Stack>
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
      <AssetUploadDrawer
        opened={uploadOpened}
        onClose={uploadCtrl.close}
        onUploaded={async () => {
          // refresh asset picker lists
          await qc.invalidateQueries({ queryKey: ['assets', 'picker'] });
          await qc.invalidateQueries({ queryKey: AssetsQueryKey.lists() });
        }}
      />
    </form>
  );
}
