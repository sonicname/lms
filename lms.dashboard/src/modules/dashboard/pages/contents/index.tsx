import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Drawer,
  Flex,
  Group,
  Pagination,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import appEnv from 'app-env';
import { useMemo, useState } from 'react';
import { LuExternalLink, LuEye, LuTrash2, LuUpload, LuTags } from 'react-icons/lu';
import SkeletonCard from '../../../../components/skeleton-card';
import AssetDeleteModal from '../../../assets/components/asset-delete-modal';
import AssetDetailsDrawer from '../../../assets/components/asset-details-drawer';
import AssetTagManager from '../../../assets/components/asset-tag-manager';
import AssetUploadDrawer from '../../../assets/components/asset-upload-drawer';
import { AssetsQueryKey } from '../../../assets/constants/assets-query-key';
import type {
  AssetModel,
  ListAssetFilterModel,
} from '../../../assets/models/asset.model';
import { assetsApi } from '../../../assets/services/assets.api';

export default function ContentManagerPage() {
  const [filter, setFilter] = useState<ListAssetFilterModel>({
    page: 1,
    limit: 10,
  });
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagsOpen, { open: openTags, close: closeTags }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [uploadOpened, { open: openUpload, close: closeUpload }] =
    useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] =
    useDisclosure(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewedAsset, setViewedAsset] = useState<AssetModel | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      ...AssetsQueryKey.lists(),
      { ...filter, search: debouncedSearch },
    ],
    queryFn: async () => assetsApi.list({ ...filter, search: debouncedSearch }),
  });

  const assets = useMemo(() => {
    const list = data?.data ?? [];
    if (!selectedTag) return list;
    // client-side filter by tag name
    return list.filter((a) =>
      (a.assetsTags || []).some((t) => t.name === selectedTag),
    );
  }, [data, selectedTag]);
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => assetsApi.delete(id),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã xoá',
        message: 'Nội dung đã xoá',
        color: 'green',
      });
      await qc.invalidateQueries({ queryKey: AssetsQueryKey.lists() });
      closeDelete();
      setSelectedId(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Không thể xoá nội dung';
      notifications.show({ title: 'Lỗi', message, color: 'red' });
    },
  });

  const rows = useMemo(
    () =>
      assets.map((a: AssetModel) => (
        <Table.Tr key={a.id}>
          <Table.Td>
            <Group gap='sm'>
              {a.fileType === 'image' ? (
                <Avatar src={a.url} radius='xl' size={32} alt={a.filename} />
              ) : (
                <Avatar radius='xl' size={32}>
                  {(a.filename[0] || '?').toUpperCase()}
                </Avatar>
              )}
              <div>
                <Text fz='sm' fw={500}>
                  {a.filename}
                </Text>
                <Text fz='xs' c='dimmed'>
                  {a.mimetype}
                </Text>
              </div>
            </Group>
          </Table.Td>
          <Table.Td>
            <Badge variant='light'>{a.fileType}</Badge>
          </Table.Td>
          <Table.Td>
            <Text fz='sm'>{(a.fileSize / 1024 / 1024).toFixed(2)} MB</Text>
          </Table.Td>
          <Table.Td>
            <Group gap='xs'>
              <Tooltip label='Xem chi tiết'>
                <ActionIcon
                  variant='subtle'
                  color='blue'
                  onClick={() => {
                    setViewedAsset(a);
                    openView();
                  }}
                >
                  <LuEye />
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Preview'>
                <ActionIcon
                  variant='subtle'
                  color='grape'
                  onClick={() => {
                    const full = new URL(a.url, appEnv.apiUrl).toString();
                    window.open(full, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <LuExternalLink />
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Xoá'>
                <ActionIcon
                  variant='subtle'
                  color='red'
                  onClick={() => {
                    setSelectedId(a.id);
                    openDelete();
                  }}
                >
                  <LuTrash2 />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Table.Td>
        </Table.Tr>
      )),
    [assets, openDelete, openView],
  );

  if (isLoading) return <SkeletonCard isFullHeight lines={8} />;

  return (
    <div className='p-4 flex flex-col gap-y-2'>
      <Flex justify='space-between' align='center'>
        <TextInput
          placeholder='Tìm theo tên hoặc loại...'
          value={search}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setSearch(v);
            // Reset page immediately on raw search change for UX
            setFilter((f) => ({ ...f, page: 1 }));
          }}
          w={300}
        />
        <Group>
          <Button leftSection={<LuTags />} variant='light' onClick={openTags}>
            Tag
          </Button>
          <Button leftSection={<LuUpload />} onClick={openUpload}>
            Tải lên
          </Button>
        </Group>
      </Flex>

      <Table striped withTableBorder withRowBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tên</Table.Th>
            <Table.Th>Loại</Table.Th>
            <Table.Th>Kích thước</Table.Th>
            <Table.Th style={{ width: 140 }}>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text c='dimmed' ta='center'>
                  Không có nội dung
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Group justify='space-between' mt='md'>
        <Text size='sm' c='dimmed'>
          Tổng: {meta.total ?? assets.length}
        </Text>
        <Pagination
          total={meta.totalPages ?? 1}
          value={meta.page ?? 1}
          onChange={(page) => setFilter((f) => ({ ...f, page }))}
        />
      </Group>

      <Drawer
        opened={tagsOpen}
        onClose={closeTags}
        title='Quản lý & lọc theo Tag'
        position='left'
        size='md'
      >
        <AssetTagManager
          currentFilter={selectedTag}
          onSelectFilter={(tag) => {
            setSelectedTag(tag);
            setFilter((f) => ({ ...f, page: 1 }));
          }}
        />
      </Drawer>

      <AssetDeleteModal
        opened={deleteOpened}
        loading={deleteMutation.status === 'pending'}
        onClose={closeDelete}
        onConfirm={() => selectedId && deleteMutation.mutate(selectedId)}
      />

      <AssetUploadDrawer
        opened={uploadOpened}
        onClose={closeUpload}
        onUploaded={async () => {
          await qc.invalidateQueries({ queryKey: AssetsQueryKey.lists() });
        }}
      />

      <AssetDetailsDrawer
        opened={viewOpened}
        asset={viewedAsset}
        onClose={() => {
          closeView();
          setViewedAsset(null);
        }}
      />
    </div>
  );
}
