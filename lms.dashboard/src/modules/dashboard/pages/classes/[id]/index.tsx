import { Badge, Card, Group, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { ClassesQueryKey } from '../../../../classes/constants/classes-query-key';
import { classesApi } from '../../../../classes/services/classes.api';

export default function ClassDetailRootPage() {
  const { id } = useParams();
  const { data } = useQuery({
    enabled: !!id,
    queryKey: id ? ClassesQueryKey.detail(id) : ['classes', 'detail', 'none'],
    queryFn: () => (id ? classesApi.getOne(id) : Promise.resolve(null)),
  });
  if (!data) return <Text size='sm'>Đang tải...</Text>;
  return (
    <Card withBorder>
      <Stack gap='xs'>
        <Group gap='sm'>
          <Badge color='blue' variant='light'>
            Mã lớp: {data.code}
          </Badge>
          <Badge color='teal' variant='light'>
            Tạo lúc: {new Date(data.createdAt).toLocaleString()}
          </Badge>
        </Group>
        <Text size='sm' c='dimmed'>
          Giáo viên phụ trách: {data.teacher.name || data.teacher.email}
        </Text>
        <Text size='sm'>Tổng học sinh: {data.students.length}</Text>
        <Text size='sm'>
          Đang chờ duyệt:{' '}
          {
            data.students.filter(
              (s: { status: string }) => s.status === 'pending',
            ).length
          }
        </Text>
      </Stack>
    </Card>
  );
}
