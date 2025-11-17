import { Carousel } from '@mantine/carousel';
import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Skeleton,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import appEnv from 'app-env';
import { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router';
import { getMyClassDetail } from '~/modules/school-schedule/services/classes.api';
import {
  listChapters,
  listLessons,
  type ChapterModel,
  type LessonModel,
} from '~/modules/school-schedule/services/curriculum.api';

export default function DetailClassIndexPage() {
  const { id: classId } = useParams();
  const [opened, setOpened] = useState<string | null>(null);
  const navigate = useNavigate();

  const chaptersQuery = useQuery({
    enabled: !!classId,
    queryKey: ['student', 'chapters', classId],
    queryFn: () => listChapters(classId!),
  });

  // pick first chapter default open
  useEffect(() => {
    if (!opened && chaptersQuery.data && chaptersQuery.data.length) {
      setOpened(chaptersQuery.data[0].id);
    }
  }, [chaptersQuery.data, opened]);

  const lessonsQuery = useQuery({
    enabled: !!classId && !!opened,
    queryKey: ['student', 'lessons', classId, opened],
    queryFn: () => listLessons(classId!, opened!),
  });

  // fetch class meta using dedicated student detail API
  const classMetaQuery = useQuery({
    enabled: !!classId,
    queryKey: ['student', 'class-meta', classId],
    queryFn: () => getMyClassDetail(classId!),
  });

  const lessonsByChapter = useMemo(() => {
    const map = new Map<string, LessonModel[]>();
    if (opened && lessonsQuery.data) map.set(opened, lessonsQuery.data);
    return map;
  }, [opened, lessonsQuery.data]);

  return (
    <Container size={1200} py='lg'>
      <Button
        variant='light'
        size='xs'
        mb='md'
        leftSection={<FiArrowLeft size={14} />}
        onClick={() => navigate(-1)}
      >
        Quay lại
      </Button>
      <Grid gutter='lg'>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder>
            <Title order={4} mb='md'>
              Chương & Bài học
            </Title>
            {chaptersQuery.isPending ? (
              <Skeleton height={120} />
            ) : (chaptersQuery.data || []).length ? (
              <Accordion
                value={opened}
                onChange={(v) => setOpened((v as string) || null)}
                chevronPosition='left'
              >
                {(chaptersQuery.data as ChapterModel[]).map((ch) => (
                  <Accordion.Item key={ch.id} value={ch.id}>
                    <Accordion.Control>
                      <Group justify='space-between' wrap='nowrap'>
                        <Text fw={600}>{ch.title}</Text>
                        <Badge variant='light'>Thứ tự {ch.displayOrder}</Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <div className='flex flex-col gap-2'>
                        {(lessonsByChapter.get(ch.id) || []).map((l) => {
                          const when = l.scheduleDate
                            ? new Date(l.scheduleDate)
                            : null;
                          const isFuture = when
                            ? when.getTime() > Date.now()
                            : false;
                          return (
                            <Card
                              key={l.id}
                              withBorder
                              padding='sm'
                              onClick={() => {
                                navigate(`/school-schedule/${classId}/${l.id}`);
                              }}
                            >
                              <Group justify='space-between' align='center'>
                                <div>
                                  <Text fw={600}>{l.title}</Text>
                                  <Text size='sm' c='dimmed'>
                                    {(l.content || '').slice(0, 120)}
                                    {(l.content || '').length > 120 ? '…' : ''}
                                  </Text>
                                </div>
                                <div>
                                  {when ? (
                                    <Badge
                                      color={isFuture ? 'yellow' : 'green'}
                                      variant='light'
                                    >
                                      {when.toLocaleString()}
                                    </Badge>
                                  ) : (
                                    <Badge color='blue' variant='light'>
                                      Không lịch
                                    </Badge>
                                  )}
                                </div>
                              </Group>
                            </Card>
                          );
                        })}
                        {/* Lazy-load lessons when switching accordion */}
                        {opened === ch.id && lessonsQuery.isPending && (
                          <Skeleton height={60} />
                        )}
                      </div>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <Text c='dimmed'>Không có chương</Text>
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder>
            <Title order={5} mb='xs'>
              Thông tin lớp học
            </Title>
            {/* Banner carousel / fallback */}
            {classMetaQuery.isPending ? (
              <Skeleton height={180} mb='md' />
            ) : classMetaQuery.data?.banners?.length ? (
              <Carousel withIndicators height={180} mb='md'>
                {classMetaQuery.data.banners.map((b) => (
                  <Carousel.Slide key={b.id}>
                    <Image
                      src={`${appEnv.apiUrl}${b.url}`}
                      alt={b.filename}
                      h={180}
                      radius='sm'
                      fit='cover'
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            ) : (
              <Image
                src='https://picsum.photos/800/180'
                h={180}
                radius='sm'
                mb='md'
                alt='banner placeholder'
              />
            )}
            {classMetaQuery.isPending ? (
              <>
                <Skeleton height={18} width='60%' mb='xs' />
                <Skeleton height={12} width='90%' mb='xs' />
                <Skeleton height={12} width='80%' />
              </>
            ) : classMetaQuery.data ? (
              <div className='flex flex-col gap-6'>
                <div className='flex flex-col gap-2'>
                  <Title order={6}>{classMetaQuery.data.name}</Title>
                  <Text size='sm' c='dimmed'>
                    {classMetaQuery.data.description || '—'}
                  </Text>
                </div>
                <Group gap='xs'>
                  <Avatar
                    src={
                      classMetaQuery.data.teacher?.image
                        ? `${appEnv.apiUrl}${classMetaQuery.data.teacher.image}`
                        : undefined
                    }
                    radius='xl'
                    size={40}
                  />
                  <div>
                    <Text size='sm' fw={500}>
                      {classMetaQuery.data.teacher?.name ||
                        'Không rõ giáo viên'}
                    </Text>
                    <Text size='xs' c='dimmed'>
                      {classMetaQuery.data.teacher?.email}
                    </Text>
                  </div>
                </Group>
              </div>
            ) : (
              <Text c='dimmed'>Không tìm thấy thông tin lớp</Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
