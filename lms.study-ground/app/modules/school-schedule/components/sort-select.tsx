import { Group, Select, Text } from '@mantine/core';

export type SortValue = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

export default function SortSelect({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (next: SortValue) => void;
}) {
  return (
    <Group gap='xs' align='center'>
      <Text size='sm' c='dimmed'>
        Sắp xếp
      </Text>
      <Select
        value={value}
        onChange={(v) => onChange((v as SortValue) || 'newest')}
        data={[
          { value: 'newest', label: 'Mới nhất' },
          { value: 'oldest', label: 'Cũ nhất' },
          { value: 'name-asc', label: 'Tên A-Z' },
          { value: 'name-desc', label: 'Tên Z-A' },
        ]}
        allowDeselect={false}
        styles={{ input: { width: 140 } }}
      />
    </Group>
  );
}
