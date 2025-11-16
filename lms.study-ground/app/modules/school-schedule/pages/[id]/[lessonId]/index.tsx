import {
  Accordion,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Modal,
  Skeleton,
  Text,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import appEnv from 'app-env';
import type { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  listLessonAssets,
  type AssetModel,
} from '~/modules/school-schedule/services/assets.api';
import {
  listMyClasses,
  type ClassModel,
} from '~/modules/school-schedule/services/classes.api';
import {
  listChapters,
  listLessons,
  type ChapterModel,
  type LessonModel,
} from '~/modules/school-schedule/services/curriculum.api';

export default function LessonDetailIndexPage() {
  const { id: classId, lessonId } = useParams();
  const navigate = useNavigate();
  const [openedChapter, setOpenedChapter] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Chapters
  const chaptersQuery = useQuery({
    enabled: !!classId,
    queryKey: ['student', 'chapters', classId],
    queryFn: () => listChapters(classId!),
  });

  // Lessons for all chapters (to locate lesson & provide navigation)
  const allLessonsQuery = useQuery({
    enabled: !!classId && !!chaptersQuery.data,
    queryKey: ['student', 'all-lessons', classId],
    queryFn: async () => {
      const chapters = chaptersQuery.data as ChapterModel[];
      const results = await Promise.all(
        chapters.map((ch) => listLessons(classId!, ch.id)),
      );
      return chapters.reduce<Record<string, LessonModel[]>>((acc, ch, idx) => {
        acc[ch.id] = results[idx];
        return acc;
      }, {});
    },
  });

  // Determine current lesson & containing chapter
  const current = useMemo(() => {
    if (!lessonId || !allLessonsQuery.data) return null;
    for (const [chId, lessons] of Object.entries(allLessonsQuery.data)) {
      const found = lessons.find((l) => l.id === lessonId);
      if (found) return { lesson: found, chapterId: chId };
    }
    return null;
  }, [lessonId, allLessonsQuery.data]);

  // Set initial opened chapter
  useEffect(() => {
    if (openedChapter) return;
    if (current) setOpenedChapter(current.chapterId);
    else if (chaptersQuery.data && chaptersQuery.data.length)
      setOpenedChapter(chaptersQuery.data[0].id);
  }, [current, chaptersQuery.data, openedChapter]);

  // Assets for current lesson
  const assetsQuery = useQuery({
    enabled: !!classId && !!current,
    queryKey: ['student', 'lesson-assets', classId, current?.lesson.id],
    queryFn: () =>
      listLessonAssets(classId!, current!.chapterId, current!.lesson.id),
  });
  console.log('🚀 ~ assetsQuery:', assetsQuery);

  // Class meta (title/description/teacher)
  const classMetaQuery = useQuery({
    enabled: !!classId,
    queryKey: ['student', 'class-meta', classId],
    queryFn: async () => {
      const page1 = await listMyClasses({ page: 1, limit: 50 });
      return (page1.data.find((c) => c.id === classId) ||
        null) as ClassModel | null;
    },
  });

  const chapters: ChapterModel[] = (chaptersQuery.data as ChapterModel[]) || [];
  const lessonsMap: Record<string, LessonModel[]> =
    (allLessonsQuery.data as Record<string, LessonModel[]>) || {};

  const renderAsset = (asset: AssetModel) => {
    const mt = asset.mimetype || '';
    if (mt.startsWith('image/')) {
      return (
        <Card key={asset.id} withBorder padding='sm'>
          <Image
            src={asset.url}
            alt={asset.filename || asset.id}
            radius='md'
            style={{ cursor: 'zoom-in', maxWidth: '100%' }}
            onClick={() => setZoomImage(asset.url)}
          />
          <Text size='xs' mt='xs' c='dimmed'>
            {asset.filename}
          </Text>
        </Card>
      );
    }
    if (mt.startsWith('video/')) {
      return (
        <Card key={asset.id} withBorder padding='sm'>
          <video
            controls
            style={{ width: '100%', borderRadius: 8 }}
            src={`${appEnv.apiUrl}${asset.url}`}
          />
          <Text size='xs' mt='xs' c='dimmed'>
            {asset.filename}
          </Text>
        </Card>
      );
    }
    if (mt === 'application/pdf' || asset.url.toLowerCase().endsWith('.pdf')) {
      return (
        <Card key={asset.id} withBorder padding='sm'>
          <iframe
            src={asset.url}
            title={asset.filename || asset.id}
            style={{ width: '100%', height: 480, border: 'none' }}
          />
          <Group justify='space-between' mt='xs'>
            <Text size='sm'>{asset.filename || 'Tài liệu PDF'}</Text>
            <Button
              variant='light'
              size='xs'
              onClick={() => window.open(asset.url, '_blank')}
            >
              Mở trong tab mới
            </Button>
          </Group>
        </Card>
      );
    }
    // fallback
    return (
      <Card key={asset.id} withBorder padding='sm'>
        <Group justify='space-between'>
          <div>
            <Text size='sm' fw={600}>
              {asset.filename || asset.id}
            </Text>
            <Text size='xs' c='dimmed'>
              {mt || 'Không rõ loại'}
            </Text>
          </div>
          <Button
            size='xs'
            variant='light'
            onClick={() => window.open(asset.url, '_blank')}
          >
            Tải về
          </Button>
        </Group>
      </Card>
    );
  };

  return (
    <Container size={1200} py='lg'>
      <Grid gutter='lg'>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder>
            {current ? (
              <>
                <Title order={4} mb='xs'>
                  {current.lesson.title}
                </Title>
                <Text size='sm' c='dimmed' mb='md'>
                  {current.lesson.content || 'Không có nội dung mô tả.'}
                </Text>
                <div className='flex flex-col gap-4'>
                  {assetsQuery.isPending && (
                    <Skeleton height={200} radius='md' />
                  )}
                  {!assetsQuery.isPending && assetsQuery.data?.length === 0 && (
                    <Text c='dimmed'>Không có nội dung đính kèm</Text>
                  )}
                  {assetsQuery.data?.map(renderAsset)}
                  {assetsQuery.error && (
                    <Text color='red'>
                      {((assetsQuery.error as AxiosError).response?.data as any)
                        ?.message || (assetsQuery.error as AxiosError).message}
                    </Text>
                  )}
                </div>
              </>
            ) : (
              <Text c='dimmed'>Đang tải bài học...</Text>
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder>
            <Title order={5} mb='md'>
              Danh sách chương
            </Title>
            {chaptersQuery.isPending ? (
              <Skeleton height={160} />
            ) : chapters.length ? (
              <Accordion
                value={openedChapter}
                onChange={(v) => setOpenedChapter((v as string) || null)}
                chevronPosition='left'
              >
                {chapters.map((ch) => (
                  <Accordion.Item key={ch.id} value={ch.id}>
                    <Accordion.Control>
                      <Group justify='space-between'>
                        <Text fw={600}>{ch.title}</Text>
                        <Badge variant='light'>Thứ tự {ch.displayOrder}</Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <div className='flex flex-col gap-2'>
                        {(lessonsMap[ch.id] || []).map((l) => {
                          const active = l.id === lessonId;
                          return (
                            <Card
                              key={l.id}
                              withBorder
                              padding='xs'
                              style={{
                                cursor: 'pointer',
                                backgroundColor: active
                                  ? 'var(--mantine-color-blue-light)'
                                  : undefined,
                              }}
                              onClick={() => {
                                if (l.id !== lessonId)
                                  navigate(
                                    `/school-schedule/${classId}/${l.id}`,
                                  );
                              }}
                            >
                              <Group justify='space-between'>
                                <Text size='sm' fw={500}>
                                  {l.title}
                                </Text>
                                <Text size='xs' c='dimmed'>
                                  #{l.displayOrder}
                                </Text>
                              </Group>
                            </Card>
                          );
                        })}
                        {openedChapter === ch.id &&
                          allLessonsQuery.isPending && <Skeleton height={40} />}
                      </div>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <Text c='dimmed'>Không có chương</Text>
            )}
          </Card>
          <Card withBorder mt='md'>
            <Title order={6} mb='xs'>
              Thông tin lớp
            </Title>
            {classMetaQuery.isPending ? (
              <Skeleton height={60} />
            ) : classMetaQuery.data ? (
              <div className='flex flex-col gap-1'>
                <Text fw={600}>{classMetaQuery.data.name}</Text>
                <Text size='sm' c='dimmed'>
                  {classMetaQuery.data.description || '—'}
                </Text>
                <Text size='sm'>
                  Giáo viên: {classMetaQuery.data.teacherId}
                </Text>
              </div>
            ) : (
              <Text c='dimmed'>Không tìm thấy lớp</Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>
      <Modal
        opened={!!zoomImage}
        onClose={() => setZoomImage(null)}
        size='xl'
        title='Xem ảnh'
        centered
      >
        {zoomImage && (
          <Image
            src={zoomImage}
            alt='zoom'
            radius='md'
            style={{ width: '100%' }}
          />
        )}
      </Modal>
    </Container>
  );
}
