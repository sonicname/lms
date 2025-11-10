import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Pagination,
  Table,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { LuMessageSquare } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import SkeletonCard from '../../../../../components/skeleton-card';
import {
  chaptersApi,
  type ChapterItem,
} from '../../../../classes/services/chapters.api';
import {
  lessonsApi,
  type LessonItem,
} from '../../../../classes/services/lessons.api';
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
    enabled: !!selectedLesson,
    queryKey: ['lessons', selectedLesson, 'questions'],
    queryFn: () =>
      selectedLesson
        ? qnaApi.listQuestionsByLesson(selectedLesson)
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
      await qc.invalidateQueries({
        queryKey: ['lessons', selectedLesson, 'questions'],
      });
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
  const loading =
    chaptersQuery.isLoading ||
    lessonsQuery.isLoading ||
    questionsQuery.isLoading;
  if (loading) return <SkeletonCard isFullHeight lines={8} />;

  return (
    <div className='flex flex-col gap-3'>
      <Group gap='md'>
        <Tooltip label='Chọn chương'>
          <select
            className='border rounded px-2 py-1'
            value={selectedChapter ?? ''}
            onChange={(e) => {
              setSelectedChapter(e.target.value || null);
              setSelectedLesson(null);
              setPage(1);
            }}
          >
            {chaptersQuery.data?.map((c: ChapterItem) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </Tooltip>
        <Tooltip label='Chọn bài học'>
          <select
            className='border rounded px-2 py-1'
            value={selectedLesson ?? ''}
            onChange={(e) => {
              setSelectedLesson(e.target.value || null);
              setPage(1);
            }}
          >
            {lessonsQuery.data?.map((l: LessonItem) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
        </Tooltip>
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
