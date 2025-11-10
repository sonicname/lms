import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { LuMessageSquare } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import SkeletonCard from '../../../../../components/skeleton-card';
import { chaptersApi } from '../../../../classes/services/chapters.api';
import { lessonsApi } from '../../../../classes/services/lessons.api';
import {
  qnaApi,
  type CreateAnswerPayload,
  type QuestionItem,
} from '../../../../classes/services/qna.api.ts';

export default function ClassQnaPage() {
  const { id: classId } = useParams();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [answering, { open: openAnswer, close: closeAnswer }] =
    useDisclosure(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionItem | null>(
    null,
  );
  const [answerText, setAnswerText] = useState('');
  // Chapters
  const chaptersQuery = useQuery({
    enabled: !!classId,
    queryKey: ['classes', classId, 'chapters'],
    queryFn: () => (classId ? chaptersApi.list(classId) : Promise.resolve([])),
  });

  // Lessons for selected chapter
  const lessonsQuery = useQuery({
    enabled: !!selectedChapter && !!classId,
    queryKey: ['classes', classId, 'chapters', selectedChapter, 'lessons'],
    queryFn: () =>
      selectedChapter && classId
        ? lessonsApi.list(classId, selectedChapter)
        : Promise.resolve([]),
  });

  // Questions for selected lesson
  const questionsQuery = useQuery({
    enabled: !!selectedLesson && !!selectedChapter && !!classId,
    queryKey: [
      'classes',
      classId,
      'chapters',
      selectedChapter,
      'lessons',
      selectedLesson,
      'questions',
    ],
    queryFn: () =>
      selectedLesson && selectedChapter && classId
        ? qnaApi.listQuestionsFull(classId, selectedChapter, selectedLesson)
        : Promise.resolve([]),
  });

  // Auto-select first chapter & lesson when available
  useMemo(() => {
    if (!selectedChapter && chaptersQuery.data?.length) {
      setSelectedChapter(chaptersQuery.data[0].id);
    }
  }, [chaptersQuery.data, selectedChapter]);
  useMemo(() => {
    if (!selectedLesson && lessonsQuery.data?.length) {
      setSelectedLesson(lessonsQuery.data[0].id);
    }
  }, [lessonsQuery.data, selectedLesson]);

  const questions = useMemo(
    () => questionsQuery.data ?? [],
    [questionsQuery.data],
  );
  const total = questions.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pagedQuestions = useMemo(
    () => questions.slice((page - 1) * limit, page * limit),
    [questions, page, limit],
  );

  const answerMutation = useMutation({
    mutationFn: async (vars: {
      questionId: string;
      payload: CreateAnswerPayload;
    }) => qnaApi.createAnswer(vars.questionId, vars.payload),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã trả lời',
        message: 'Câu hỏi đã được trả lời',
        color: 'green',
      });
      if (classId && selectedChapter && selectedLesson) {
        await qc.invalidateQueries({
          queryKey: [
            'classes',
            classId,
            'chapters',
            selectedChapter,
            'lessons',
            selectedLesson,
            'questions',
          ],
        });
      }
      if (currentQuestion?.id) {
        await qc.invalidateQueries({
          queryKey: ['questions', currentQuestion.id, 'answers'],
        });
      }
      closeAnswer();
      setCurrentQuestion(null);
      setAnswerText('');
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Không thể trả lời câu hỏi';
      notifications.show({ title: 'Lỗi', message, color: 'red' });
    },
  });

  const rows = useMemo(
    () =>
      pagedQuestions.map((q: QuestionItem) => (
        <Table.Tr key={q.id}>
          <Table.Td>
            <Text fw={500}>{q.title}</Text>
            <Text size='sm' c='dimmed'>
              {q.content}
            </Text>
          </Table.Td>
          <Table.Td>—</Table.Td>
          <Table.Td>—</Table.Td>
          <Table.Td style={{ width: 120 }}>
            <Group gap='xs'>
              <Tooltip label='Trả lời'>
                <ActionIcon
                  variant='subtle'
                  color='teal'
                  onClick={() => {
                    setCurrentQuestion(q);
                    setAnswerText('');
                    openAnswer();
                  }}
                >
                  <LuMessageSquare />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Table.Td>
        </Table.Tr>
      )),
    [pagedQuestions, openAnswer],
  );

  // Answers of current question (shown inside drawer)
  const answersQuery = useQuery({
    enabled: !!currentQuestion?.id,
    queryKey: ['questions', currentQuestion?.id, 'answers'],
    queryFn: () =>
      currentQuestion?.id
        ? qnaApi.listAnswers(currentQuestion.id)
        : Promise.resolve([]),
  });

  if (
    chaptersQuery.isLoading ||
    lessonsQuery.isLoading ||
    questionsQuery.isLoading
  ) {
    return <SkeletonCard isFullHeight lines={8} />;
  }

  return (
    <div className='flex flex-col gap-3'>
      <Group gap='md' align='flex-end'>
        <Select
          label='Chọn chương'
          placeholder='Chọn chương'
          data={(chaptersQuery.data ?? []).map((c) => ({
            value: c.id,
            label: c.title,
          }))}
          value={selectedChapter ?? null}
          onChange={(val) => {
            setSelectedChapter(val || null);
            setSelectedLesson(null);
            setPage(1);
          }}
          searchable
          nothingFoundMessage='Không có chương'
          w={260}
        />
        <Select
          label='Chọn bài học'
          placeholder='Chọn bài học'
          data={(lessonsQuery.data ?? []).map((l) => ({
            value: l.id,
            label: l.title,
          }))}
          value={selectedLesson ?? null}
          onChange={(val) => {
            setSelectedLesson(val || null);
            setPage(1);
          }}
          searchable
          disabled={!selectedChapter}
          nothingFoundMessage={
            selectedChapter ? 'Không có bài học' : 'Chọn chương trước'
          }
          w={260}
        />
      </Group>

      <Table striped withTableBorder withRowBorders highlightOnHover mt='md'>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Câu hỏi</Table.Th>
            <Table.Th>(Trạng thái)</Table.Th>
            <Table.Th>(Người hỏi)</Table.Th>
            <Table.Th>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text c='dimmed' ta='center'>
                  Không có câu hỏi nào
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Group justify='space-between' mt='md'>
        <Text size='sm' c='dimmed'>
          Tổng: {total}
        </Text>
        <Pagination
          total={totalPages}
          value={page}
          onChange={(p) => setPage(p)}
        />
      </Group>

      <Drawer
        opened={answering}
        onClose={closeAnswer}
        title={
          currentQuestion
            ? `Trả lời: ${currentQuestion.title}`
            : 'Trả lời câu hỏi'
        }
        position='right'
        size='md'
      >
        <div className='flex flex-col gap-3'>
          <Text fw={500}>Câu hỏi</Text>
          <Text c='dimmed'>{currentQuestion?.content}</Text>
          <Stack gap='xs'>
            <Text fw={500}>
              Danh sách câu trả lời ({answersQuery.data?.length ?? 0})
            </Text>
            {answersQuery.isLoading && (
              <Text size='sm'>Đang tải câu trả lời...</Text>
            )}
            {!answersQuery.isLoading && !answersQuery.data?.length && (
              <Text size='sm' c='dimmed'>
                Chưa có câu trả lời nào
              </Text>
            )}
            {answersQuery.data?.map((a) => (
              <div
                key={a.id}
                className='border border-neutral-200 rounded px-3 py-2'
              >
                <Text size='sm'>{a.content}</Text>
                <Text size='xs' c='dimmed'>
                  Thời gian đăng:{' '}
                  {dayjs(a.createdAt).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
            ))}
          </Stack>
          <Textarea
            label='Câu trả lời'
            placeholder='Nhập câu trả lời...'
            minRows={6}
            value={answerText}
            onChange={(e) => setAnswerText(e.currentTarget.value)}
          />
          <Group justify='flex-end'>
            <Button variant='default' onClick={closeAnswer}>
              Huỷ
            </Button>
            <Button
              onClick={() => {
                if (!currentQuestion) return;
                if (!answerText.trim()) {
                  notifications.show({
                    title: 'Thiếu nội dung',
                    message: 'Vui lòng nhập câu trả lời',
                    color: 'yellow',
                  });
                  return;
                }
                answerMutation.mutate({
                  questionId: currentQuestion.id,
                  payload: { content: answerText },
                });
              }}
              loading={answerMutation.status === 'pending'}
            >
              Gửi trả lời
            </Button>
          </Group>
        </div>
      </Drawer>
    </div>
  );
}
