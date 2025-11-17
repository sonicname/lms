import {
  Badge,
  Card,
  Group,
  Image,
  Skeleton,
  Text,
  Title,
} from '@mantine/core';
import appEnv from 'app-env';
import { useNavigate } from 'react-router';
import type { ClassModel } from '~/modules/school-schedule/services/classes.api';

export function ClassesList({
  classes,
  loading,
}: {
  classes: ClassModel[] | undefined;
  loading?: boolean;
}) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} withBorder>
            <Skeleton height={18} width='70%' mb='sm' />
            <Skeleton height={12} width='50%' mb='xs' />
            <Skeleton height={12} width='90%' />
          </Card>
        ))}
      </div>
    );
  }

  if (!classes || classes.length === 0) {
    return (
      <Card withBorder>
        <Text c='dimmed' ta='center'>
          Không có lớp học phù hợp
        </Text>
      </Card>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
      {classes.map((c) => (
        <Card
          key={c.id}
          withBorder
          className='cursor-pointer'
          onClick={() => navigate(`/school-schedule/${c.id}`)}
        >
          <Card.Section>
            <Image
              src={`${appEnv.apiUrl}${c.banners?.[0]?.url}`}
              alt={c.banners?.[0]?.filename || c.name}
              h={140}
              fit='cover'
            />
          </Card.Section>
          <Group justify='space-between' align='start'>
            <div>
              <Title order={5}>{c.name}</Title>
              <Text size='sm' c='dimmed'>
                {c.description || '—'}
              </Text>
            </div>
            <Badge color='blue' variant='light'>
              {c.code}
            </Badge>
          </Group>

          <div>
            <Text size='sm' mt='md'>
              Giáo viên: {c.teacher?.name || c.teacher?.email}
            </Text>
          </div>
        </Card>
      ))}
    </div>
  );
}
