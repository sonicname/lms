import { Button, Group, Select, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';

export type FiltersState = {
  search: string;
  limit: number;
};

export default function ClassesFilters({
  value,
  onApply,
}: {
  value: FiltersState;
  onApply: (next: FiltersState) => void;
}) {
  const [search, setSearch] = useState<string>(value.search);
  const [limit, setLimit] = useState<string>(String(value.limit));

  useEffect(() => {
    setSearch(value.search);
    setLimit(String(value.limit));
  }, [value.search, value.limit]);

  const handleApply = () => {
    onApply({ search: search.trim(), limit: Number(limit) });
  };

  return (
    <Group gap='sm' wrap='wrap'>
      <TextInput
        placeholder='Tìm lớp theo tên hoặc mã...'
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        style={{ flex: 1, minWidth: 260 }}
      />
      <Select
        data={[
          { value: '10', label: '10 / trang' },
          { value: '20', label: '20 / trang' },
          { value: '50', label: '50 / trang' },
        ]}
        value={limit}
        onChange={(v) => setLimit(v || '10')}
        style={{ width: 140 }}
      />
      <Button onClick={handleApply}>Lọc</Button>
    </Group>
  );
}
