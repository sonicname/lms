import {
  Accordion,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Image,
  Modal,
  Skeleton,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import appEnv from 'app-env';
import type { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { FiPlayCircle } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router';
import VideoPlayer from '~/components/video-player';
import {
  listLessonAssets,
  type AssetModel,
} from '~/modules/school-schedule/services/assets.api';
import {
  getMyClassDetail,
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
  // Expanded state for lesson description (must be top-level hook, not inside conditional render)
  const [descExpanded, setDescExpanded] = useState(false);

  // Reset expanded description when navigating to a different lesson
  useEffect(() => {
    setDescExpanded(false);
  }, [lessonId]);

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
      try {
        return (await getMyClassDetail(classId!)) as ClassModel;
      } catch (e) {
        return null;
      }
    },
  });

  const chapters: ChapterModel[] = (chaptersQuery.data as ChapterModel[]) || [];
  const lessonsMap: Record<string, LessonModel[]> =
    (allLessonsQuery.data as Record<string, LessonModel[]>) || {};
  const totalLessons = Object.values(lessonsMap).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

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
          <VideoPlayer src={`${appEnv.apiUrl}${asset.url}`} />
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
                {/* Hero video (first video asset) */}
                {assetsQuery.isPending ? (
                  <Skeleton height={320} radius='md' mb='md' />
                ) : (
                  (() => {
                    const videoAsset = assetsQuery.data?.find((a) =>
                      (a.mimetype || '').startsWith('video/'),
                    );
                    if (videoAsset) {
                      return (
                        <Card withBorder padding='xs' mb='md'>
                          <VideoPlayer
                            src={`${appEnv.apiUrl}${videoAsset.url}`}
                          />
                          <Text size='xs' mt='xs' c='dimmed'>
                            {videoAsset.filename}
                          </Text>
                        </Card>
                      );
                    }
                    return null;
                  })()
                )}

                {/* Lesson title */}
                <Title order={4} mb='sm'>
                  {current.lesson.title}
                </Title>

                {/* Description with expandable toggle (hooks lifted to top-level to avoid conditional hook order changes) */}
                <div style={{ marginBottom: 16 }}>
                  <Title order={6} mb={6}>
                    Mô tả
                  </Title>
                  {(() => {
                    const raw = current.lesson.content || '';
                    const max = 450;
                    const display =
                      descExpanded || raw.length <= max
                        ? raw
                        : raw.slice(0, max) + '…';
                    return raw ? (
                      <Text size='sm' style={{ whiteSpace: 'pre-line' }}>
                        {display}
                      </Text>
                    ) : (
                      <Text size='sm' c='dimmed'>
                        Không có nội dung mô tả.
                      </Text>
                    );
                  })()}
                  {current.lesson.content &&
                    current.lesson.content.length > 450 && (
                      <Button
                        variant='subtle'
                        size='xs'
                        mt='xs'
                        onClick={() => setDescExpanded((v) => !v)}
                      >
                        {descExpanded ? 'Thu gọn' : 'Xem thêm'}
                      </Button>
                    )}
                </div>

                {/* Other assets except first video */}
                <div className='flex flex-col gap-4'>
                  {assetsQuery.isPending && (
                    <Skeleton height={160} radius='md' />
                  )}
                  {!assetsQuery.isPending && assetsQuery.data?.length === 0 && (
                    <Text c='dimmed'>Không có nội dung đính kèm</Text>
                  )}
                  {assetsQuery.data
                    ?.filter((a) =>
                      !(a.mimetype || '').startsWith('video/') ||
                      a ===
                        assetsQuery.data?.find((v) =>
                          (v.mimetype || '').startsWith('video/'),
                        )
                        ? false
                        : true,
                    )
                    .map(renderAsset)}
                  {assetsQuery.error && (
                    <Text color='red'>
                      {((assetsQuery.error as AxiosError).response?.data as any)
                        ?.message || (assetsQuery.error as AxiosError).message}
                    </Text>
                  )}
                </div>
                {/* Ask a question (placed below media/assets) */}
                <Card withBorder padding='sm' mt='md'>
                  <AskQuestion
                    classId={classId!}
                    chapterId={current.chapterId}
                    lessonId={current.lesson.id}
                  />
                </Card>
              </>
            ) : (
              <Text c='dimmed'>Đang tải bài học...</Text>
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder>
            <Title order={5} mb={6}>
              Chương trình học
            </Title>
            <Group gap={12} mb='md'>
              <Text size='sm' c='dimmed'>
                {chapters.length} phần
              </Text>
              <Text size='sm' c='dimmed'>
                •
              </Text>
              <Text size='sm' c='dimmed'>
                {totalLessons} bài học
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
              <Skeleton height={160} />
            ) : chapters.length ? (
              <Accordion
                value={openedChapter}
                onChange={(v) => setOpenedChapter((v as string) || null)}
                chevronPosition='left'
                variant='contained'
                radius='md'
              >
                {chapters.map((ch) => (
                  <Accordion.Item key={ch.id} value={ch.id}>
                    <Accordion.Control
                      style={{ background: 'var(--mantine-color-gray-1)' }}
                    >
                      <Text fw={700}>{ch.title}</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {(lessonsMap[ch.id] || []).map((l) => {
                          const active = l.id === lessonId;
                          return (
                            <div
                              key={l.id}
                              role='button'
                              onClick={() => {
                                if (l.id !== lessonId)
                                  navigate(
                                    `/school-schedule/${classId}/${l.id}`,
                                  );
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderBottom:
                                  '1px solid var(--mantine-color-gray-3)',
                                cursor: 'pointer',
                                background: active
                                  ? 'var(--mantine-color-blue-light)'
                                  : 'white',
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

type AskQuestionProps = {
  classId: string;
  chapterId: string;
  lessonId: string;
};

import { TextInput, Textarea } from '@mantine/core';
import {
  useMutation,
  useQueryClient,
  useQuery as useRQ,
} from '@tanstack/react-query';
import {
  createQuestion,
  listQuestions,
} from '~/modules/school-schedule/services/qa.api';

function AskQuestion({ classId, chapterId, lessonId }: AskQuestionProps) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [opened, setOpened] = useState(false);

  const questionsQuery = useRQ({
    queryKey: ['student', 'questions', classId, chapterId, lessonId],
    queryFn: () => listQuestions(classId, chapterId, lessonId),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createQuestion(classId, chapterId, lessonId, { title, content }),
    onSuccess: () => {
      setTitle('');
      setContent('');
      qc.invalidateQueries({
        queryKey: ['student', 'questions', classId, chapterId, lessonId],
      });
    },
  });

  const disabled = !title.trim() || !content.trim() || mutation.isPending;
  const count = questionsQuery.data?.length || 0;

  return (
    <Accordion
      value={opened ? 'qa' : null}
      onChange={(v) => setOpened(v === 'qa')}
      radius='md'
      variant='contained'
    >
      <Accordion.Item value='qa'>
        <Accordion.Control>
          <Group justify='space-between' wrap='nowrap'>
            <Text fw={700}>Hỏi đáp</Text>
            <Text size='sm' c='dimmed'>
              {count} câu hỏi
            </Text>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <TextInput
              placeholder='Tiêu đề câu hỏi'
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />
            <Textarea
              placeholder='Nội dung câu hỏi'
              minRows={3}
              value={content}
              onChange={(e) => setContent(e.currentTarget.value)}
            />
            <Group justify='flex-end'>
              <Button
                size='xs'
                loading={mutation.isPending}
                disabled={disabled}
                onClick={() => mutation.mutate()}
              >
                Gửi câu hỏi
              </Button>
            </Group>

            {questionsQuery.data?.length ? (
              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {questionsQuery.data.map((q) => (
                  <Card key={q.id} withBorder padding='sm'>
                    <Text fw={600}>{q.title}</Text>
                    <Text size='sm' c='dimmed'>
                      {q.content}
                    </Text>
                  </Card>
                ))}
              </div>
            ) : null}
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
