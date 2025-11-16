import { Group, Pagination, Text } from '@mantine/core';

export default function Paginator({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <Group justify='space-between' align='center'>
      <Text size='sm' c='dimmed'>
        Trang {page} / {totalPages}
      </Text>
      <Pagination value={page} total={totalPages} onChange={onChange} />
    </Group>
  );
}
