import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Drawer,
  Group,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import {
  LuBookPlus,
  LuFolderPlus,
  LuGripVertical,
  LuPencil,
  LuPlus,
} from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import AssetSelectModal from '../../../../assets/components/asset-select-modal';
import { useAuthStore } from '../../../../auth/stores/auth-store';
import type {
  ChapterModel,
  LessonModel,
} from '../../../../curriculum/services/curriculum.api';
import { curriculumApi } from '../../../../curriculum/services/curriculum.api';

export default function LessonManagerPage() {
  const { id: classId } = useParams();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [chaptersOrdered, setChaptersOrdered] = useState<ChapterModel[]>([]);
  const [lessonsOrdered, setLessonsOrdered] = useState<LessonModel[]>([]);

  const { getCurrentUserRole } = useAuthStore();
  const currentUserRole = getCurrentUserRole();

  const [createOpen, setCreateOpen] = useState(false);
  const [editChapter, setEditChapter] = useState<ChapterModel | null>(null);
  const [editLesson, setEditLesson] = useState<{
    chapterId: string;
    lesson: LessonModel;
  } | null>(null);
  const [attachLesson, setAttachLesson] = useState<{
    chapterId: string;
    lessonId: string;
  } | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const chaptersQuery = useQuery({
    enabled: !!classId,
    queryKey: classId
      ? ['classes', 'chapters', classId]
      : ['classes', 'chapters', 'none'],
    queryFn: () => curriculumApi.listChapters(classId!),
  });

  // initialize local order state when chapters load
  useEffect(() => {
    if (chaptersQuery.data) {
      const sorted = [...chaptersQuery.data].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      );
      setChaptersOrdered(sorted);
      if (!expanded && sorted.length) setExpanded(sorted[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaptersQuery.data]);

  // Lessons for expanded chapter
  const lessonsQuery = useQuery({
    enabled: !!classId && !!expanded,
    queryKey:
      classId && expanded
        ? ['classes', 'lessons', classId, expanded]
        : ['classes', 'lessons', 'none'],
    queryFn: () => curriculumApi.listLessons(classId!, expanded!),
  });

  // initialize lesson local order when lesson list changes for expanded chapter
  useEffect(() => {
    if (expanded && lessonsQuery.data) {
      const sorted = [...lessonsQuery.data].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      );
      setLessonsOrdered(sorted);
    } else {
      setLessonsOrdered([]);
    }
  }, [lessonsQuery.data, expanded]);

  // asset search moved into AssetsMultiPicker component

  const createChapterMutation = useMutation({
    mutationFn: (payload: { title: string; content?: string | null }) =>
      curriculumApi.createChapter(classId!, payload),
    onSuccess: () => {
      notifications.show({ color: 'green', message: 'Đã tạo chương' });
      qc.invalidateQueries({ queryKey: ['classes', 'chapters', classId] });
      setCreateOpen(false);
    },
    onError: (err: unknown) => {
      const apiMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      notifications.show({
        color: 'red',
        message: apiMessage || 'Tạo chương thất bại',
      });
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: (vars: {
      chapterId: string;
      payload: {
        title?: string;
        content?: string | null;
        displayOrder?: number;
      };
    }) => curriculumApi.updateChapter(classId!, vars.chapterId, vars.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['classes', 'chapters', classId] });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: (vars: {
      chapterId: string;
      lessonId: string;
      payload: {
        title?: string;
        content?: string | null;
        displayOrder?: number;
        scheduleDate?: string | null;
      };
    }) =>
      curriculumApi.updateLesson(
        classId!,
        vars.chapterId,
        vars.lessonId,
        vars.payload,
      ),
    onSuccess: (_, vars) => {
      notifications.show({ color: 'green', message: 'Đã lưu bài học' });
      qc.invalidateQueries({
        queryKey: ['classes', 'lessons', classId, vars.chapterId],
      });
      setEditLesson(null);
    },
    onError: (err: unknown) => {
      const apiMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      notifications.show({
        color: 'red',
        message: apiMessage || 'Lưu bài học thất bại',
      });
    },
  });

  const attachAssetsMutation = useMutation({
    mutationFn: (vars: {
      chapterId: string;
      lessonId: string;
      assetIds: string[];
    }) =>
      curriculumApi.attachAssetsToLesson(
        classId!,
        vars.chapterId,
        vars.lessonId,
        vars.assetIds,
      ),
    onSuccess: async () => {
      notifications.show({
        color: 'green',
        message: 'Đã gán nội dung cho bài học',
      });
      if (attachLesson) {
        await qc.invalidateQueries({
          queryKey: ['classes', 'lessons', classId, attachLesson.chapterId],
        });
      }
      setAttachLesson(null);
      setSelectedAssets([]);
    },
    onError: (err: unknown) => {
      const apiMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      notifications.show({
        color: 'red',
        message: apiMessage || 'Gán nội dung thất bại',
      });
    },
  });

  // dnd-kit sensors & drag end
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const persistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistOrder = async (ordered: ChapterModel[]) => {
    const changed = ordered.filter(
      (c, idx) =>
        chaptersQuery.data?.find((x) => x.id === c.id)?.displayOrder !==
        idx + 1,
    );
    if (!changed.length) return;
    try {
      await Promise.all(
        changed.map((c) =>
          updateChapterMutation.mutateAsync({
            chapterId: c.id,
            payload: { displayOrder: c.displayOrder },
          }),
        ),
      );
      notifications.show({
        color: 'green',
        message: 'Đã cập nhật thứ tự chương',
      });
      qc.invalidateQueries({ queryKey: ['classes', 'chapters', classId] });
    } catch (err: unknown) {
      const apiMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      notifications.show({
        color: 'red',
        message: apiMessage || 'Cập nhật thứ tự thất bại',
      });
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = chaptersOrdered.findIndex(
      (c) => c.id === String(active.id),
    );
    const newIndex = chaptersOrdered.findIndex((c) => c.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(chaptersOrdered, oldIndex, newIndex).map(
      (c, idx) => ({ ...c, displayOrder: idx + 1 }),
    );
    setChaptersOrdered(reordered);
    if (persistTimeoutRef.current) clearTimeout(persistTimeoutRef.current);
    persistTimeoutRef.current = setTimeout(() => persistOrder(reordered), 500);
  };

  // DnD for lessons within expanded chapter
  const persistLessonTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const persistLessonOrder = async (ordered: LessonModel[]) => {
    const changed = ordered.filter(
      (l, idx) =>
        lessonsQuery.data?.find((x) => x.id === l.id)?.displayOrder !== idx + 1,
    );
    if (!changed.length || !expanded) return;
    try {
      await Promise.all(
        changed.map((l) =>
          curriculumApi.updateLesson(classId!, expanded, l.id, {
            displayOrder: l.displayOrder,
          }),
        ),
      );
      notifications.show({
        color: 'green',
        message: 'Đã cập nhật thứ tự bài học',
      });
      qc.invalidateQueries({
        queryKey: ['classes', 'lessons', classId, expanded],
      });
    } catch (err: unknown) {
      const apiMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      notifications.show({
        color: 'red',
        message: apiMessage || 'Cập nhật thứ tự bài học thất bại',
      });
    }
  };

  const handleLessonDragEnd = (event: DragEndEvent) => {
    if (!expanded) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lessonsOrdered.findIndex(
      (l) => l.id === String(active.id),
    );
    const newIndex = lessonsOrdered.findIndex((l) => l.id === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(lessonsOrdered, oldIndex, newIndex).map(
      (l, idx) => ({ ...l, displayOrder: idx + 1 }),
    );
    setLessonsOrdered(reordered);
    if (persistLessonTimeoutRef.current)
      clearTimeout(persistLessonTimeoutRef.current);
    persistLessonTimeoutRef.current = setTimeout(
      () => persistLessonOrder(reordered),
      500,
    );
  };

  const createLessonMutation = useMutation({
    mutationFn: (vars: {
      chapterId: string;
      payload: {
        title: string;
        content?: string | null;
        scheduleDate?: string | null;
      };
    }) => curriculumApi.createLesson(classId!, vars.chapterId, vars.payload),
    onSuccess: (_, vars) => {
      notifications.show({ color: 'green', message: 'Đã tạo bài học' });
      qc.invalidateQueries({
        queryKey: ['classes', 'lessons', classId, vars.chapterId],
      });
      setNewLessonChapter(null);
    },
    onError: (err: unknown) => {
      const apiMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message;
      notifications.show({
        color: 'red',
        message: apiMessage || 'Tạo bài học thất bại',
      });
    },
  });

  const [newLessonChapter, setNewLessonChapter] = useState<string | null>(null);

  const ChapterRow = ({ c }: { c: ChapterModel }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: c.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    } as React.CSSProperties;
    const isExpanded = expanded === c.id;
    return (
      <Card
        withBorder
        key={c.id}
        className='mb-3'
        ref={setNodeRef}
        style={style}
      >
        <Group justify='space-between'>
          <Group gap='sm'>
            {currentUserRole === 'teacher' && (
              <span {...attributes} {...listeners}>
                <LuGripVertical size={18} style={{ cursor: 'grab' }} />
              </span>
            )}
            <div
              onClick={() => setExpanded(isExpanded ? null : c.id)}
              style={{ cursor: 'pointer' }}
            >
              <Title order={5}>{c.title}</Title>
              <Text size='xs' c='dimmed'>
                Thứ tự: {c.displayOrder}
              </Text>
            </div>
          </Group>
          <Group gap='xs'>
            <Button
              size='xs'
              variant='light'
              leftSection={<LuBookPlus size={16} />}
              onClick={() => setNewLessonChapter(c.id)}
              disabled={currentUserRole !== 'teacher'}
            >
              Thêm bài
            </Button>
            <Button
              size='xs'
              variant='light'
              leftSection={<LuPencil size={16} />}
              onClick={() => setEditChapter(c)}
              disabled={currentUserRole !== 'teacher'}
            >
              Sửa
            </Button>
          </Group>
        </Group>

        {isExpanded && (
          <Card mt='md' withBorder>
            {lessonsOrdered.length ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLessonDragEnd}
              >
                <SortableContext
                  items={lessonsOrdered.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <LessonsTable lessons={lessonsOrdered} />
                </SortableContext>
              </DndContext>
            ) : (
              <LessonsTable lessons={[]} />
            )}
          </Card>
        )}
      </Card>
    );
  };

  function LessonRow({ lesson }: { lesson: LessonModel }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: lesson.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    } as React.CSSProperties;
    const when = lesson.scheduleDate ? new Date(lesson.scheduleDate) : null;
    const isFuture = when ? when.getTime() > Date.now() : false;
    return (
      <Table.Tr ref={setNodeRef} style={style}>
        <Table.Td>
          <Group gap='xs'>
            {currentUserRole === 'teacher' && (
              <span {...attributes} {...listeners}>
                <LuGripVertical size={16} style={{ cursor: 'grab' }} />
              </span>
            )}
            <div>
              <Text fw={500} size='sm'>
                {lesson.title}
              </Text>
              <Text size='xs' c='dimmed'>
                {(lesson.content || '').slice(0, 100)}
                {(lesson.content || '').length > 100 ? '…' : ''}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          {when ? (
            <Group gap={6} wrap='nowrap'>
              <Text size='sm'>{when.toLocaleString()}</Text>
              <Badge color={isFuture ? 'yellow' : 'green'} variant='light'>
                {isFuture ? 'Sắp diễn ra' : 'Đã diễn ra'}
              </Badge>
            </Group>
          ) : (
            <Badge color='blue' variant='light'>
              Không lịch
            </Badge>
          )}
        </Table.Td>
        <Table.Td>
          <Text size='sm'>{lesson.displayOrder}</Text>
        </Table.Td>
        <Table.Td style={{ width: 100 }}>
          <Button
            size='xs'
            variant='light'
            leftSection={<LuPencil size={14} />}
            onClick={() =>
              setEditLesson({ chapterId: expanded!, lesson: lesson })
            }
            disabled={currentUserRole !== 'teacher'}
          >
            Sửa
          </Button>
        </Table.Td>
        <Table.Td style={{ width: 60 }}>
          <ActionIcon
            variant='subtle'
            color='violet'
            onClick={() =>
              setAttachLesson({ chapterId: expanded!, lessonId: lesson.id })
            }
            title='Gán nội dung'
            disabled={currentUserRole !== 'teacher'}
          >
            <LuFolderPlus />
          </ActionIcon>
        </Table.Td>
      </Table.Tr>
    );
  }

  const LessonsTable = ({ lessons }: { lessons: LessonModel[] }) => {
    return (
      <Table striped withTableBorder withRowBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Bài học</Table.Th>
            <Table.Th>Lịch học</Table.Th>
            <Table.Th>Thứ tự</Table.Th>
            <Table.Th style={{ width: 100 }}>Hành động</Table.Th>
            <Table.Th style={{ width: 60 }}>Nội dung</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lessons.length ? (
            lessons.map((l) => <LessonRow key={l.id} lesson={l} />)
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5}>
                <Text c='dimmed' ta='center'>
                  {lessonsQuery.status === 'pending'
                    ? 'Đang tải...'
                    : 'Không có bài học'}
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    );
  };

  return (
    <div className='flex flex-col gap-3'>
      <Card withBorder>
        <Group justify='space-between'>
          <div>
            <Title order={4}>Chương & Bài học</Title>
            <Text size='sm' c='dimmed'>
              Kéo thả để sắp xếp chương. Bấm vào chương để mở danh sách bài học.
            </Text>
          </div>
          <Button
            leftSection={<LuPlus size={16} />}
            onClick={() => setCreateOpen(true)}
            disabled={currentUserRole !== 'teacher'}
          >
            Tạo chương
          </Button>
        </Group>
      </Card>

      <div>
        {chaptersOrdered.length ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chaptersOrdered.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {chaptersOrdered.map((c) => (
                <ChapterRow key={c.id} c={c} />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <Card withBorder>
            <Text c='dimmed'>
              {chaptersQuery.status === 'pending'
                ? 'Đang tải...'
                : 'Chưa có chương nào'}
            </Text>
          </Card>
        )}
      </div>

      {/* Create Chapter Drawer */}
      <Drawer
        opened={createOpen}
        onClose={() => setCreateOpen(false)}
        title='Tạo chương'
        position='right'
        size='lg'
      >
        <CreateOrEditChapterForm
          onSubmit={(values) => createChapterMutation.mutate(values)}
          submitting={createChapterMutation.isPending}
        />
      </Drawer>

      {/* Edit Chapter Drawer */}
      <Drawer
        opened={!!editChapter}
        onClose={() => setEditChapter(null)}
        title='Chỉnh sửa chương'
        position='right'
        size='lg'
      >
        {editChapter && (
          <CreateOrEditChapterForm
            initial={{
              title: editChapter.title,
              content: editChapter.content || '',
            }}
            onSubmit={(values) =>
              updateChapterMutation.mutate({
                chapterId: editChapter.id,
                payload: values,
              })
            }
            submitting={updateChapterMutation.isPending}
          />
        )}
      </Drawer>

      {/* Edit Lesson Drawer */}
      <Drawer
        opened={!!editLesson}
        onClose={() => setEditLesson(null)}
        title='Chỉnh sửa bài học'
        position='right'
        size='lg'
      >
        {editLesson && (
          <EditLessonForm
            lesson={editLesson.lesson}
            onSubmit={(payload) =>
              updateLessonMutation.mutate({
                chapterId: editLesson.chapterId,
                lessonId: editLesson.lesson.id,
                payload,
              })
            }
            submitting={updateLessonMutation.isPending}
          />
        )}
      </Drawer>

      {/* Create Lesson Drawer */}
      <Drawer
        opened={!!newLessonChapter}
        onClose={() => setNewLessonChapter(null)}
        title='Thêm bài học'
        position='right'
        size='lg'
      >
        {newLessonChapter && (
          <CreateLessonForm
            onSubmit={(vals) =>
              createLessonMutation.mutate({
                chapterId: newLessonChapter,
                payload: vals,
              })
            }
            submitting={createLessonMutation.isPending}
          />
        )}
      </Drawer>

      {/* Attach Assets Modal */}
      <AssetSelectModal
        opened={!!attachLesson}
        onClose={() => {
          setAttachLesson(null);
          setSelectedAssets([]);
        }}
        title='Gán nội dung cho bài học'
        value={selectedAssets}
        onChange={setSelectedAssets}
        onSubmit={() => {
          if (!attachLesson) return;
          if (!selectedAssets.length) {
            notifications.show({
              color: 'yellow',
              message: 'Chọn ít nhất một nội dung',
            });
            return;
          }
          attachAssetsMutation.mutate({
            chapterId: attachLesson.chapterId,
            lessonId: attachLesson.lessonId,
            assetIds: selectedAssets,
          });
        }}
      />
    </div>
  );
}

function CreateOrEditChapterForm({
  onSubmit,
  submitting,
  initial,
}: {
  onSubmit: (values: { title: string; content?: string | null }) => void;
  submitting?: boolean;
  initial?: { title: string; content?: string | null };
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [content, setContent] = useState<string>(initial?.content || '');
  const submit = () => {
    if (!title.trim()) {
      notifications.show({
        color: 'red',
        message: 'Tiêu đề không được để trống',
      });
      return;
    }
    onSubmit({ title: title.trim(), content: content.trim() || null });
  };
  return (
    <div className='flex flex-col gap-3'>
      <TextInput
        label='Tiêu đề'
        placeholder='Nhập tiêu đề chương'
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />
      <Textarea
        label='Mô tả'
        placeholder='Mô tả (tuỳ chọn)'
        minRows={4}
        value={content}
        onChange={(e) => setContent(e.currentTarget.value)}
      />
      <Group justify='flex-end'>
        <Button loading={!!submitting} onClick={submit}>
          Lưu
        </Button>
      </Group>
    </div>
  );
}

function EditLessonForm({
  lesson,
  onSubmit,
  submitting,
}: {
  lesson: LessonModel;
  onSubmit: (values: {
    title?: string;
    content?: string | null;
    displayOrder?: number;
    scheduleDate?: string | null;
  }) => void;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState<string>(lesson.content || '');
  const [displayOrder, setDisplayOrder] = useState<number>(lesson.displayOrder);
  const [schedule, setSchedule] = useState<Date | null>(
    lesson.scheduleDate ? new Date(lesson.scheduleDate) : null,
  );

  const submit = () => {
    if (!title.trim()) {
      notifications.show({
        color: 'red',
        message: 'Tiêu đề không được để trống',
      });
      return;
    }
    onSubmit({
      title: title.trim(),
      content: content.trim() || null,
      displayOrder: displayOrder || 1,
      scheduleDate: schedule ? dayjs(schedule).toISOString() : null,
    });
  };

  return (
    <div className='flex flex-col gap-3'>
      <TextInput
        label='Tiêu đề'
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />
      <Textarea
        label='Nội dung'
        minRows={4}
        value={content}
        onChange={(e) => setContent(e.currentTarget.value)}
      />
      <TextInput
        label='Thứ tự hiển thị'
        type='number'
        value={displayOrder}
        onChange={(e) => setDisplayOrder(Number(e.currentTarget.value))}
      />
      <DateTimePicker
        label='Lịch học'
        value={schedule}
        onChange={(d) => setSchedule(d as Date | null)}
        clearable
      />
      <Group justify='flex-end'>
        <Button loading={!!submitting} onClick={submit}>
          Lưu
        </Button>
      </Group>
    </div>
  );
}

function CreateLessonForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (values: {
    title: string;
    content?: string | null;
    scheduleDate?: string | null;
  }) => void;
  submitting?: boolean;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [schedule, setSchedule] = useState<Date | null>(null);
  const submit = () => {
    if (!title.trim()) {
      notifications.show({
        color: 'red',
        message: 'Tiêu đề không được để trống',
      });
      return;
    }
    onSubmit({
      title: title.trim(),
      content: content.trim() || null,
      scheduleDate: schedule ? dayjs(schedule).toISOString() : null,
    });
  };
  return (
    <div className='flex flex-col gap-3'>
      <TextInput
        label='Tiêu đề'
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
      />
      <Textarea
        label='Nội dung'
        minRows={4}
        value={content}
        onChange={(e) => setContent(e.currentTarget.value)}
      />
      <DateTimePicker
        label='Lịch học'
        value={schedule}
        onChange={(d) => setSchedule(d as Date | null)}
        clearable
      />
      <Group justify='flex-end'>
        <Button loading={!!submitting} onClick={submit}>
          Tạo
        </Button>
      </Group>
    </div>
  );
}
