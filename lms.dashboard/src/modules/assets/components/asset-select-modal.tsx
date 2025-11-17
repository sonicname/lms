import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Group,
  Image,
  Loader,
  Modal,
  Pagination,
  ScrollArea,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import appEnv from 'app-env';
import React from 'react';
import { assetsApi } from '../../assets/services/assets.api';
import type {
  AssetModel,
  ListAssetFilterModel,
  ListAssetModel,
} from '../models/asset.model';

export interface AssetSelectModalProps {
  opened: boolean;
  onClose: () => void;
  value: string[]; // selected asset IDs
  onChange?: (ids: string[]) => void; // live update on toggle
  onSubmit?: (ids: string[]) => void; // confirm selection
  title?: string;
  multiple?: boolean; // allow multiple selection
  pageSize?: number;
  extraFilters?: Partial<ListAssetFilterModel>; // type, fileType, sort
}

export default function AssetSelectModal({
  opened,
  onClose,
  value,
  onChange,
  onSubmit,
  title = 'Chọn nội dung',
  multiple = true,
  pageSize = 10,
  extraFilters,
}: AssetSelectModalProps) {
  const [selected, setSelected] = React.useState<string[]>(value || []);
  const [search, setSearch] = React.useState('');
  const [fileType, setFileType] = React.useState<string | null>(null);
  const [typeFilter, setTypeFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [debounced] = useDebouncedValue(search, 400);

  // Sync internal state when modal opens or value changes externally
  React.useEffect(() => {
    if (opened) setSelected(value || []);
  }, [opened, value]);

  const query = useQuery<ListAssetModel>({
    enabled: opened,
    queryKey: [
      'assets',
      'select-modal',
      {
        page,
        limit: pageSize,
        search: debounced,
        fileType: fileType || undefined,
        type: typeFilter || undefined,
        ...extraFilters,
      },
    ],
    queryFn: async () =>
      assetsApi.list({
        page,
        limit: pageSize,
        search: debounced,
        fileType: fileType || undefined,
        type: typeFilter || undefined,
        ...extraFilters,
      }),
    staleTime: 10_000,
  });

  const data = query.data?.data || [];
  const meta = query.data?.meta || {
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 1,
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (multiple) {
        return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      }
      return prev.includes(id) ? [] : [id];
    });
  };

  const allFromPage = data.map((a) => a.id);
  const allSelectedOnPage =
    allFromPage.length > 0 && allFromPage.every((id) => selected.includes(id));

  const toggleAllOnPage = () => {
    if (!multiple) return;
    setSelected((prev) => {
      if (allSelectedOnPage) {
        return prev.filter((id) => !allFromPage.includes(id));
      }
      return Array.from(new Set([...prev, ...allFromPage]));
    });
  };

  const handleConfirm = () => {
    onChange?.(selected);
    onSubmit?.(selected);
  };

  // Reset pagination when search changes
  React.useEffect(() => {
    setPage(1);
  }, [debounced, fileType, typeFilter]);

  return (
    <Modal opened={opened} onClose={onClose} title={title} size='lg'>
      <Stack>
        <Stack gap='xs'>
          <Group justify='space-between' align='center'>
            <TextInput
              placeholder='Tìm theo tên...'
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Badge size='sm' variant='light'>
              Đã chọn: {selected.length}
            </Badge>
          </Group>
          <Group grow>
            <Select
              label='Loại file'
              placeholder='Tất cả'
              data={[
                { value: 'image', label: 'Ảnh' },
                { value: 'video', label: 'Video' },
                { value: 'file', label: 'Tệp' },
              ]}
              clearable
              value={fileType}
              onChange={setFileType}
            />
            <TextInput
              label='Type (business)'
              placeholder='VD: banner, lesson'
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.currentTarget.value)}
            />
          </Group>
        </Stack>

        {query.isLoading ? (
          <Group justify='center' py='md'>
            <Loader size='sm' />
          </Group>
        ) : query.isError ? (
          <Text c='red' size='sm' ta='center'>
            Lỗi tải nội dung
          </Text>
        ) : (
          <>
            <Group justify='space-between' align='center'>
              <Text size='sm' c='dimmed'>
                Tổng: {meta.total} • Trang {meta.page}/{meta.totalPages}
              </Text>
              {multiple && (
                <Button
                  size='xs'
                  variant='subtle'
                  onClick={toggleAllOnPage}
                  disabled={!data.length}
                >
                  {allSelectedOnPage
                    ? 'Bỏ chọn trang này'
                    : 'Chọn tất cả trang này'}
                </Button>
              )}
            </Group>

            <ScrollArea.Autosize mah={360} type='hover' offsetScrollbars>
              <Stack gap={6}>
                {!data.length ? (
                  <Text c='dimmed' size='sm' ta='center' py='sm'>
                    Không có nội dung
                  </Text>
                ) : (
                  data.map((a: AssetModel) => {
                    const label = a.filename || a.id;
                    const checked = selected.includes(a.id);
                    return (
                      <Group key={a.id} gap='sm'>
                        {a.fileType === 'image' ? (
                          <Image
                            src={`${appEnv.apiUrl}${a.url}`}
                            w={44}
                            h={44}
                            radius='sm'
                            alt={label}
                            fit='cover'
                          />
                        ) : (
                          <Badge variant='light'>{a.fileType}</Badge>
                        )}
                        <Checkbox
                          label={label}
                          checked={checked}
                          onChange={() => toggle(a.id)}
                          style={{ flex: 1 }}
                        />
                      </Group>
                    );
                  })
                )}
              </Stack>
            </ScrollArea.Autosize>

            <Group justify='space-between' align='center'>
              <Text size='xs' c='dimmed'>
                Tổng: {meta.total}
              </Text>
              <Pagination
                total={meta.totalPages || 1}
                value={meta.page || page}
                onChange={setPage}
                size='sm'
              />
            </Group>
          </>
        )}

        <Divider />
        <Group justify='flex-end'>
          <Button variant='default' onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={handleConfirm}>Xác nhận</Button>
        </Group>
      </Stack>
    </Modal>
  );
}
