import { Carousel } from '@mantine/carousel';
import { Badge, Button, Card, Group, Image, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import appEnv from 'app-env';
import { useEffect, useRef, useState } from 'react';
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
        {Array.isArray(data.banners) && data.banners.length ? (
          <Carousel withIndicators height={220} slideSize='60%' slideGap='sm'>
            {data.banners.map((b) => (
              <Carousel.Slide key={b.id}>
                <Image
                  src={`${appEnv.apiUrl}${b.url}`}
                  alt={b.filename || b.id}
                  radius='md'
                  h={220}
                  w='100%'
                  fit='cover'
                />
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : (
          <div
            style={{
              width: '100%',
              height: 180,
              borderRadius: 12,
              background: '#f1f3f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed #dee2e6',
            }}
          >
            <Text c='dimmed'>Chưa có banner</Text>
          </div>
        )}
        <Text fw={600}>{data.name}</Text>
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
        {typeof data.description === 'string' && data.description.length > 0 ? (
          <DescriptionBlock description={data.description} />
        ) : null}
      </Stack>
    </Card>
  );
}

function DescriptionBlock({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (!ref.current || expanded) return;
    const el = ref.current;
    if (el.scrollHeight > el.clientHeight + 1) setHasOverflow(true);
    else setHasOverflow(false);
  }, [description, expanded]);

  return (
    <div>
      <Text size='sm' c='dimmed'>
        Mô tả
      </Text>
      <Text
        ref={ref}
        size='sm'
        className={expanded ? undefined : 'line-clamp-2'}
      >
        {description}
      </Text>
      {hasOverflow ? (
        <Button
          variant='subtle'
          size='xs'
          onClick={() => setExpanded((e) => !e)}
          style={{ paddingLeft: 0 }}
        >
          {expanded ? 'Thu gọn' : 'Xem thêm'}
        </Button>
      ) : null}
    </div>
  );
}
