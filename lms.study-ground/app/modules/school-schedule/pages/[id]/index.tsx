import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  Group,
  Image,
  Skeleton,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import appEnv from 'app-env';
import { useEffect, useMemo, useState } from 'react';
import { FiArrowLeft, FiCheck, FiLayers, FiPlayCircle } from 'react-icons/fi';
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

  // aggregate lessons count across chapters (for header stats)
  const lessonsCountQuery = useQuery({
    enabled: !!classId && !!chaptersQuery.data,
    queryKey: [
      'student',
      'lessons-count',
      classId,
      (chaptersQuery.data || []).length,
    ],
    queryFn: async () => {
      const chs = chaptersQuery.data || [];
      const res = await Promise.all(
        chs.map((c) => listLessons(classId!, c.id)),
      );
      return res.reduce((sum, arr) => sum + arr.length, 0);
    },
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

  const chaptersCount = chaptersQuery.data?.length || 0;

  return (
    <div>
      {/* Hero header */}
      <div
        style={{ background: 'var(--mantine-color-blue-9)', color: 'white' }}
      >
        <Container size={1200} py='lg'>
          <Button
            variant='white'
            color='dark'
            size='xs'
            mb='md'
            leftSection={<FiArrowLeft size={14} />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>

          <Grid gutter='xl' align='stretch'>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Text size='xs' c='blue.1' style={{ opacity: 0.9 }} mb={6}>
                Trang chủ • Khóa học • Chi tiết khóa học
              </Text>
              {classMetaQuery.isPending ? (
                <Skeleton height={28} width='80%' mb='sm' />
              ) : (
                <Title order={2} fw={800} style={{ color: 'white' }} mb='xs'>
                  {classMetaQuery.data?.name || '—'}
                </Title>
              )}
              {classMetaQuery.isPending ? (
                <Skeleton height={14} width='90%' mb='xs' />
              ) : (
                <Text size='sm' style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {classMetaQuery.data?.description || '—'}
                </Text>
              )}
              <Group mt='sm' gap='xs'>
                <Badge color='gray' variant='light'>
                  <Group gap={6} align='center'>
                    <ThemeIcon color='blue' variant='light' size='xs'>
                      <FiLayers size={12} />
                    </ThemeIcon>
                    <span>{chaptersCount} phần</span>
                  </Group>
                </Badge>
                {(classMetaQuery.data?.tags || []).map((t) => (
                  <Badge key={t.id} color='grape' variant='light'>
                    {t.name}
                  </Badge>
                ))}
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow='sm' padding={0} radius='md' withBorder>
                {classMetaQuery.isPending ? (
                  <Skeleton height={200} />
                ) : classMetaQuery.data?.banners?.[0] ? (
                  <Image
                    src={`${appEnv.apiUrl}${classMetaQuery.data.banners[0].url}`}
                    h={200}
                    fit='cover'
                    alt={classMetaQuery.data.banners[0].filename}
                  />
                ) : (
                  <Image
                    src='https://picsum.photos/800/200'
                    h={200}
                    fit='cover'
                    alt='banner placeholder'
                  />
                )}
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </div>

      {/* Main content */}
      <Container size={1200} py='lg'>
        <Grid gutter='lg'>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder>
              <Title order={4} mb={6}>
                Chương trình học
              </Title>
              <Group gap={12} mb='md'>
                <Text size='sm' c='dimmed'>
                  {chaptersCount} phần
                </Text>
                <Text size='sm' c='dimmed'>
                  •
                </Text>
                <Text size='sm' c='dimmed'>
                  {lessonsCountQuery.isPending
                    ? '…'
                    : `${lessonsCountQuery.data || 0} bài học`}
                </Text>
                <Text size='sm' c='dimmed'>
                  •
                </Text>
                <Text size='sm' c='dimmed'>
                  — video
                </Text>
                <Text size='sm' c='dimmed'>
                  •
                </Text>
                <Text size='sm' c='dimmed'>
                  — bài đối luyện
                </Text>
              </Group>

              {chaptersQuery.isPending ? (
                <Skeleton height={120} />
              ) : (chaptersQuery.data || []).length ? (
                <Accordion
                  value={opened}
                  onChange={(v) => setOpened((v as string) || null)}
                  chevronPosition='left'
                  variant='contained'
                >
                  {(chaptersQuery.data as ChapterModel[]).map((ch) => (
                    <Accordion.Item key={ch.id} value={ch.id}>
                      <Accordion.Control
                        style={{ background: 'var(--mantine-color-gray-1)' }}
                      >
                        <Text fw={700}>{ch.title}</Text>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <div
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          {(lessonsByChapter.get(ch.id) || []).map((l) => (
                            <div
                              key={l.id}
                              role='button'
                              onClick={() =>
                                navigate(`/school-schedule/${classId}/${l.id}`)
                              }
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '12px 12px',
                                borderBottom:
                                  '1px solid var(--mantine-color-gray-3)',
                                cursor: 'pointer',
                                background: 'white',
                              }}
                            >
                              <ThemeIcon
                                radius='xl'
                                size='sm'
                                color='gray'
                                variant='light'
                              >
                                <FiPlayCircle size={14} />
                              </ThemeIcon>
                              <Text size='sm' fw={500} c='dark.7'>
                                {l.title}
                              </Text>
                            </div>
                          ))}
                          {opened === ch.id && lessonsQuery.isPending && (
                            <Skeleton height={48} />
                          )}
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              ) : (
                <Text c='dimmed'>Không có chương</Text>
              )}

              <Button variant='outline' color='blue' fullWidth mt='sm'>
                Xem thêm
              </Button>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            {/* Teacher card */}
            <Card withBorder mb='md'>
              <Title order={6} mb='xs'>
                Giảng viên
              </Title>
              {classMetaQuery.isPending ? (
                <Skeleton height={56} />
              ) : (
                <Group gap='sm' align='center'>
                  <Avatar
                    src={
                      classMetaQuery.data?.teacher?.image
                        ? `${appEnv.apiUrl}${classMetaQuery.data.teacher.image}`
                        : undefined
                    }
                    radius='xl'
                    size={44}
                  />
                  <div>
                    <Text fw={600} size='sm'>
                      {classMetaQuery.data?.teacher?.name || '—'}
                    </Text>
                    <Text size='xs' c='dimmed'>
                      {classMetaQuery.data?.teacher?.email || ''}
                    </Text>
                  </div>
                </Group>
              )}
            </Card>

            {/* Includes card */}
            <Card withBorder mb='md'>
              <Title order={6} mb='xs'>
                Khóa học này bao gồm:
              </Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Group gap={8} wrap='nowrap'>
                  <ThemeIcon size='sm' color='green' variant='light'>
                    <FiCheck />
                  </ThemeIcon>
                  <Text size='sm'>{chaptersCount} phần (chương) nội dung</Text>
                </Group>
                <Group gap={8} wrap='nowrap'>
                  <ThemeIcon size='sm' color='green' variant='light'>
                    <FiCheck />
                  </ThemeIcon>
                  <Text size='sm'>Truy cập trọn đời</Text>
                </Group>
                <Group gap={8} wrap='nowrap'>
                  <ThemeIcon size='sm' color='green' variant='light'>
                    <FiCheck />
                  </ThemeIcon>
                  <Text size='sm'>Hỗ trợ xem trên mọi thiết bị</Text>
                </Group>
              </div>
            </Card>

            {/* Description card */}
            <Card withBorder>
              <Title order={6} mb='xs'>
                Mô tả
              </Title>
              {classMetaQuery.isPending ? (
                <>
                  <Skeleton height={12} mb={6} />
                  <Skeleton height={12} width='90%' mb={6} />
                  <Skeleton height={12} width='80%' />
                </>
              ) : (
                <Text size='sm' c='dimmed'>
                  {classMetaQuery.data?.description || '—'}
                </Text>
              )}
              <Divider my='sm' />
              {classMetaQuery.data?.tags?.length ? (
                <Group gap='xs'>
                  {classMetaQuery.data.tags.map((t) => (
                    <Badge key={t.id} variant='light' color='grape' size='sm'>
                      {t.name}
                    </Badge>
                  ))}
                </Group>
              ) : null}
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </div>
  );
}
