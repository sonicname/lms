import {
  ActionIcon,
  Badge,
  Button,
  Drawer,
  Group,
  Pagination,
  Radio,
  Stack,
  Table,
  TagsInput,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { LuPencil, LuPlus, LuTrash2 } from 'react-icons/lu';
import type {
  ChoiceModel,
  CreateQuizModel,
  QuizModel,
  UpdateQuizModel,
} from '../models/quizz.model';
import { quizzApi } from '../services/quizz.api';

export default function QuizzIndexPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [createOpened, setCreateOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [choicesOpened, setChoicesOpened] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizModel | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['quizz', 'me', { page, limit }],
    queryFn: async () => quizzApi.listMine(page, limit),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateQuizModel) =>
      quizzApi.createMine(payload),
    onSuccess: async (created) => {
      notifications.show({
        title: 'Đã tạo',
        message: 'Tạo quiz thành công',
        color: 'green',
      });
      // Attach tags if provided
      try {
        if (tags.length) {
          await quizzApi.attachTagsByNames(created.id, tags);
        }
      } catch {
        notifications.show({
          title: 'Tag',
          message: 'Gắn tag thất bại',
          color: 'yellow',
        });
      }
      setCreateOpened(false);
      setTitle('');
      setContent('');
      setTags([]);
      await qc.invalidateQueries({ queryKey: ['quizz', 'me'] });
    },
    onError: () =>
      notifications.show({
        title: 'Lỗi',
        message: 'Không tạo được',
        color: 'red',
      }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateQuizModel }) =>
      quizzApi.updateMine(id, data),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã cập nhật',
        message: 'Cập nhật quiz thành công',
        color: 'green',
      });
      // Sync tags on update
      try {
        if (editingId) {
          await quizzApi.attachTagsByNames(editingId, tags);
        }
      } catch {
        notifications.show({
          title: 'Tag',
          message: 'Cập nhật tag thất bại',
          color: 'yellow',
        });
      }
      setEditOpened(false);
      setEditingId(null);
      setTitle('');
      setContent('');
      setTags([]);
      await qc.invalidateQueries({ queryKey: ['quizz', 'me'] });
    },
    onError: () =>
      notifications.show({
        title: 'Lỗi',
        message: 'Không cập nhật được',
        color: 'red',
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => quizzApi.deleteMine(id),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã xoá',
        message: 'Đã xoá quiz',
        color: 'green',
      });
      await qc.invalidateQueries({ queryKey: ['quizz', 'me'] });
    },
    onError: () =>
      notifications.show({
        title: 'Lỗi',
        message: 'Không xoá được',
        color: 'red',
      }),
  });

  // collect all tag names from current page to help suggestions
  useEffect(() => {
    const names = new Set<string>();
    (listQuery.data?.data || []).forEach((q) =>
      (q.tags || []).forEach((t) => names.add(t.name)),
    );
    setAllTags(Array.from(names));
  }, [listQuery.data, setAllTags]);

  const rows = (listQuery.data?.data || []).map((q: QuizModel) => (
    <Table.Tr key={q.id}>
      <Table.Td>
        <Text fw={500} size='sm'>
          {q.title}
        </Text>
        <Text size='xs' c='dimmed'>
          {q.content || 'Không có mô tả'}
        </Text>
        <Group gap={6} mt={6} wrap='wrap'>
          {(q.tags || []).map((t) => (
            <Badge key={t.id} variant='light'>
              {t.name}
            </Badge>
          ))}
          {!q.tags?.length && (
            <Text size='xs' c='dimmed'>
              Chưa có tag
            </Text>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant='light' color='gray'>
          Choices
        </Badge>
      </Table.Td>
      <Table.Td style={{ width: 160 }}>
        <Group gap='xs'>
          <Tooltip label='Quản lý lựa chọn'>
            <ActionIcon
              variant='subtle'
              color='indigo'
              onClick={async () => {
                const fresh = await quizzApi.getMine(q.id);
                setActiveQuiz(fresh);
                setChoicesOpened(true);
              }}
            >
              <LuPlus />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Sửa'>
            <ActionIcon
              variant='subtle'
              color='violet'
              onClick={async () => {
                setEditingId(q.id);
                setTitle(q.title);
                setContent(q.content || '');
                // Prefetch existing tags
                try {
                  const detail = await quizzApi.getMine(q.id);
                  setTags((detail.tags || []).map((t) => t.name));
                  // populate allTags union
                  setAllTags((prev) => {
                    const names = new Set(prev);
                    (detail.tags || []).forEach((t) => names.add(t.name));
                    return Array.from(names);
                  });
                } catch {
                  // ignore
                }
                setEditOpened(true);
              }}
            >
              <LuPencil />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Xoá'>
            <ActionIcon
              variant='subtle'
              color='red'
              onClick={() => deleteMutation.mutate(q.id)}
            >
              <LuTrash2 />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div className='flex flex-col gap-3'>
      <Group justify='space-between'>
        <Text fw={600}>Quizz của tôi</Text>
        <Button onClick={() => setCreateOpened(true)} leftSection={<LuPlus />}>
          Tạo quizz
        </Button>
      </Group>

      <Table striped withTableBorder withRowBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Thông tin</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th style={{ width: 160 }}>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows}
          {!rows.length && (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text c='dimmed' ta='center'>
                  Chưa có quizz
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Group justify='center'>
        <Pagination
          total={listQuery.data?.meta.totalPages || 1}
          value={page}
          onChange={setPage}
        />
      </Group>

      {/* Create Drawer */}
      <Drawer
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        title='Tạo quizz'
        position='right'
        size='md'
      >
        <Stack gap='md'>
          <TextInput
            label='Tiêu đề'
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
          <Textarea
            label='Mô tả'
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            minRows={3}
          />
          <TagsInput
            label='Tags'
            placeholder='Nhập hoặc chọn tag'
            data={allTags}
            value={tags}
            clearable
            onChange={(val) => setTags(val)}
          />
          <Group justify='flex-end'>
            <Button variant='default' onClick={() => setCreateOpened(false)}>
              Huỷ
            </Button>
            <Button
              onClick={() =>
                createMutation.mutate({
                  title: title.trim(),
                  content: content || null,
                })
              }
              loading={createMutation.status === 'pending'}
            >
              Tạo
            </Button>
          </Group>
        </Stack>
      </Drawer>

      {/* Edit Drawer */}
      <Drawer
        opened={editOpened}
        onClose={() => setEditOpened(false)}
        title='Sửa quizz'
        position='right'
        size='md'
      >
        <Stack gap='md'>
          <TextInput
            label='Tiêu đề'
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
          <Textarea
            label='Mô tả'
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            minRows={3}
          />
          <TagsInput
            label='Tags'
            placeholder='Thêm tag cho quizz'
            data={allTags}
            value={tags}
            clearable
            onChange={(val) => setTags(val)}
          />
          <Group justify='flex-end'>
            <Button variant='default' onClick={() => setEditOpened(false)}>
              Huỷ
            </Button>
            <Button
              onClick={() =>
                editingId &&
                updateMutation.mutate({
                  id: editingId,
                  data: { title: title.trim(), content: content || null },
                })
              }
              loading={updateMutation.status === 'pending'}
            >
              Lưu
            </Button>
          </Group>
        </Stack>
      </Drawer>

      {/* Choices Drawer */}
      <ChoicesDrawer
        opened={choicesOpened}
        onClose={() => setChoicesOpened(false)}
        quiz={activeQuiz}
      />
    </div>
  );
}

function ChoicesDrawer({
  opened,
  onClose,
  quiz,
}: {
  opened: boolean;
  onClose: () => void;
  quiz: QuizModel | null;
}) {
  const qc = useQueryClient();
  const [newChoice, setNewChoice] = useState('');

  const quizDetailQuery = useQuery({
    enabled: opened && !!quiz?.id,
    queryKey: ['quizz', 'detail', quiz?.id],
    queryFn: async () => (quiz ? quizzApi.getMine(quiz.id) : null),
  });

  const choicesQuery = useQuery({
    enabled: opened && !!quiz?.id,
    queryKey: ['quizz', 'choices', quiz?.id],
    queryFn: async () => (quiz ? quizzApi.listChoices(quiz.id) : []),
  });

  const createChoiceMutation = useMutation({
    mutationFn: async (payload: { content: string; isCorrect?: boolean }) =>
      quizzApi.createChoice(quiz!.id, payload),
    onSuccess: async () => {
      setNewChoice('');
      await qc.invalidateQueries({ queryKey: ['quizz', 'choices', quiz?.id] });
    },
  });

  const updateChoiceMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { content?: string; isCorrect?: boolean };
    }) => quizzApi.updateChoice(quiz!.id, id, data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['quizz', 'choices', quiz?.id] });
      await qc.invalidateQueries({ queryKey: ['quizz', 'detail', quiz?.id] });
      await qc.invalidateQueries({ queryKey: ['quizz', 'me'] });
    },
  });

  const deleteChoiceMutation = useMutation({
    mutationFn: async (id: string) => quizzApi.deleteChoice(quiz!.id, id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['quizz', 'choices', quiz?.id] });
      await qc.invalidateQueries({ queryKey: ['quizz', 'me'] });
    },
  });

  const correctChoiceId =
    quizDetailQuery.data?.correctChoiceId ?? quiz?.correctChoiceId ?? null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={`Lựa chọn cho: ${quiz?.title || ''}`}
      position='right'
      size='md'
    >
      <Stack gap='md'>
        <Group align='flex-end'>
          <TextInput
            label='Thêm lựa chọn'
            value={newChoice}
            onChange={(e) => setNewChoice(e.currentTarget.value)}
            className='grow'
          />
          <Button
            onClick={() =>
              newChoice.trim() &&
              createChoiceMutation.mutate({ content: newChoice.trim() })
            }
          >
            Thêm
          </Button>
        </Group>

        <Table striped withRowBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 60 }}>Đúng</Table.Th>
              <Table.Th>Nội dung</Table.Th>
              <Table.Th style={{ width: 80 }}>Xoá</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(choicesQuery.data || []).map((c: ChoiceModel) => (
              <Table.Tr key={c.id}>
                <Table.Td>
                  <Radio
                    checked={correctChoiceId === c.id}
                    onChange={() =>
                      updateChoiceMutation.mutate({
                        id: c.id,
                        data: { isCorrect: true },
                      })
                    }
                  />
                </Table.Td>
                <Table.Td>
                  <Text>{c.content}</Text>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    color='red'
                    variant='subtle'
                    onClick={() => deleteChoiceMutation.mutate(c.id)}
                  >
                    <LuTrash2 />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
            {!choicesQuery.data?.length && (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c='dimmed' ta='center'>
                    Chưa có lựa chọn
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Stack>
    </Drawer>
  );
}
