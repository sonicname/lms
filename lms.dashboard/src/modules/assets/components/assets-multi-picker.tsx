import {
  Button,
  Checkbox,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { assetsApi } from '../../assets/services/assets.api';
import type { ListAssetFilterModel } from '../models/asset.model';

interface AssetsMultiPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
  classId?: string; // reserved if later we scope assets by class
  searchPlaceholder?: string;
  listEmptyLabel?: string;
  maxHeight?: number;
  disabled?: boolean;
  extraFilters?: Partial<ListAssetFilterModel>;
}

// Contract:
// inputs: value (selected asset ids), search text typed by user
// outputs: onChange invoked with new array of selected ids
// errors: silently shows generic message when query fails
// edge cases handled: empty search, loading state, no results, disabled
export function AssetsMultiPicker({
  value,
  onChange,
  classId, // currently unused but kept for future filtering
  searchPlaceholder = 'Tìm nội dung...',
  listEmptyLabel = 'Không có nội dung',
  maxHeight = 260,
  disabled = false,
  extraFilters,
}: AssetsMultiPickerProps) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 400);

  const query = useQuery({
    enabled: !disabled,
    queryKey: [
      'assets',
      'picker',
      { classId: classId || 'none', search: debounced, ...extraFilters },
    ],
    queryFn: async () =>
      assetsApi.list({ search: debounced, page: 1, ...extraFilters }),
    staleTime: 10_000,
  });

  // Ensure deselected items that disappear from results remain selected (design choice)
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const allFromResults = (query.data?.data || []).map(
    (a: { id: string }) => a.id,
  );
  const allSelectedWithinResults =
    allFromResults.every((id) => value.includes(id)) &&
    allFromResults.length > 0;

  const toggleAllInResults = () => {
    if (allSelectedWithinResults) {
      // remove only those that are in current results
      onChange(value.filter((id) => !allFromResults.includes(id)));
    } else {
      // add missing ones
      const merged = Array.from(new Set([...value, ...allFromResults]));
      onChange(merged);
    }
  };

  return (
    <Stack gap='sm'>
      <TextInput
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        disabled={disabled}
      />
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
          {(query.data?.data || []).length > 0 && (
            <Group justify='space-between'>
              <Button
                size='xs'
                variant='subtle'
                onClick={toggleAllInResults}
                disabled={disabled}
              >
                {allSelectedWithinResults
                  ? 'Bỏ chọn tất cả kết quả'
                  : 'Chọn tất cả kết quả'}
              </Button>
              <Text size='xs' c='dimmed'>
                {(query.data?.data || []).length} mục
              </Text>
            </Group>
          )}
          <ScrollArea style={{ maxHeight }} type='hover' offsetScrollbars>
            <Stack gap={4}>
              {(query.data?.data || []).length === 0 ? (
                <Text c='dimmed' size='sm' ta='center' py='sm'>
                  {listEmptyLabel}
                </Text>
              ) : (
                (query.data?.data || []).map(
                  (a: { id: string; filename?: string }) => {
                    const label = a.filename || a.id;
                    return (
                      <Checkbox
                        key={a.id}
                        label={label}
                        checked={value.includes(a.id)}
                        onChange={() => toggle(a.id)}
                        disabled={disabled}
                      />
                    );
                  },
                )
              )}
            </Stack>
          </ScrollArea>
        </>
      )}
    </Stack>
  );
}

export default AssetsMultiPicker;
