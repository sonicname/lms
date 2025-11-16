import { Badge, Card, Group, Image, Stack, Text, Title } from '@mantine/core';
import type { ClassModel } from '~/modules/school-schedule/services/classes.api';

export default function ClassListItemRow({ c }: { c: ClassModel }) {
  const img = `https://picsum.photos/seed/${encodeURIComponent(c.id)}/260/160`;

  return (
    <Card withBorder padding='sm' radius='md'>
      <Group align='start' wrap='nowrap' gap='md'>
        <Image src={img} alt={c.name} width={240} height={140} radius='md' />
        <Stack gap={6} style={{ flex: 1 }}>
          <Title order={5}>{c.name}</Title>
          <Text size='sm' c='dimmed'>
            {c.description || 'Khóa học không có mô tả.'}
          </Text>
          <Group gap='xs'>
            <Badge color='blue' variant='light'>
              Mã: {c.code}
            </Badge>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}
