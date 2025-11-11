import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Stack,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { LuCheck, LuPencil, LuPlus, LuTrash, LuX } from 'react-icons/lu';
import { assetsApi } from '../services/assets.api';

// Query keys
const tagListKey = (search: string) => ['assets', 'tags', { search }];

export interface AssetTagManagerProps {
  onSelectFilter?: (tagName: string | null) => void;
  currentFilter?: string | null;
}

export default function AssetTagManager({
  onSelectFilter,
  currentFilter,
}: AssetTagManagerProps) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [createName, setCreateName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // simple debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const tagsQuery = useQuery<{ id: string; name: string }[]>({
    queryKey: tagListKey(debouncedSearch),
    queryFn: () => assetsApi.listTags(debouncedSearch),
  });

  const createMutation = useMutation<
    { id: string; name: string },
    unknown,
    string
  >({
    mutationFn: (name: string) => assetsApi.createTag(name),
    onSuccess: async () => {
      notifications.show({ color: 'green', message: 'Đã tạo tag' });
      setCreateName('');
      await qc.invalidateQueries({ queryKey: tagListKey(debouncedSearch) });
    },
    onError: () => {
      notifications.show({ color: 'red', message: 'Tạo tag thất bại' });
    },
  });

  const updateMutation = useMutation<
    { id: string; name: string },
    unknown,
    { id: string; name: string }
  >({
    mutationFn: (vars: { id: string; name: string }) =>
      assetsApi.updateTag(vars.id, vars.name),
    onSuccess: async () => {
      notifications.show({ color: 'green', message: 'Đã cập nhật tag' });
      setEditingId(null);
      setEditingName('');
      await qc.invalidateQueries({ queryKey: tagListKey(debouncedSearch) });
    },
    onError: () =>
      notifications.show({ color: 'red', message: 'Cập nhật tag thất bại' }),
  });

  const deleteMutation = useMutation<{ success: boolean }, unknown, string>({
    mutationFn: (id: string) => assetsApi.deleteTag(id),
    onSuccess: async () => {
      notifications.show({ color: 'green', message: 'Đã xoá tag' });
      await qc.invalidateQueries({ queryKey: tagListKey(debouncedSearch) });
    },
    onError: () =>
      notifications.show({ color: 'red', message: 'Xoá tag thất bại' }),
  });

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <Stack gap='sm'>
      <Group grow>
        <TextInput
          placeholder='Tìm tag'
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <TextInput
          placeholder='Tag mới'
          value={createName}
          onChange={(e) => setCreateName(e.currentTarget.value)}
        />
        <Button
          leftSection={<LuPlus size={16} />}
          onClick={() =>
            createName.trim() && createMutation.mutate(createName.trim())
          }
          loading={createMutation.isPending}
          disabled={!createName.trim()}
        >
          Tạo
        </Button>
      </Group>
      {tagsQuery.isLoading ? (
        <Group justify='center'>
          <Loader size='sm' />
        </Group>
      ) : tagsQuery.data && tagsQuery.data.length ? (
        <Stack gap={4}>
          {tagsQuery.data.map((tag) => (
            <Group key={tag.id} gap='xs' justify='space-between'>
              {editingId === tag.id ? (
                <>
                  <TextInput
                    value={editingName}
                    onChange={(e) => setEditingName(e.currentTarget.value)}
                    style={{ flex: 1 }}
                  />
                  <ActionIcon
                    color='green'
                    variant='light'
                    onClick={() =>
                      editingName.trim() &&
                      updateMutation.mutate({
                        id: tag.id,
                        name: editingName.trim(),
                      })
                    }
                  >
                    <LuCheck size={16} />
                  </ActionIcon>
                  <ActionIcon color='red' variant='light' onClick={cancelEdit}>
                    <LuX size={16} />
                  </ActionIcon>
                </>
              ) : (
                <>
                  <Group gap={6} style={{ flex: 1 }}>
                    <Badge
                      variant={currentFilter === tag.name ? 'filled' : 'light'}
                      color={currentFilter === tag.name ? 'violet' : 'gray'}
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        onSelectFilter &&
                        onSelectFilter(
                          currentFilter === tag.name ? null : tag.name,
                        )
                      }
                    >
                      {tag.name}
                    </Badge>
                  </Group>
                  <Group gap={4}>
                    <Tooltip label='Sửa'>
                      <ActionIcon
                        variant='subtle'
                        onClick={() => startEdit(tag.id, tag.name)}
                      >
                        <LuPencil size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label='Xoá'>
                      <ActionIcon
                        color='red'
                        variant='subtle'
                        onClick={() => deleteMutation.mutate(tag.id)}
                      >
                        <LuTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </>
              )}
            </Group>
          ))}
        </Stack>
      ) : (
        <Badge color='gray' variant='light'>
          Không có tag
        </Badge>
      )}
    </Stack>
  );
}
