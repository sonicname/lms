import {
  ActionIcon,
  Button,
  Card,
  Group,
  Select,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { LuEye, LuPlus } from 'react-icons/lu';
import { classesApi } from '../../../classes/services/classes.api';
import type {
  ChapterModel,
  LessonModel,
} from '../../../curriculum/services/curriculum.api';
import { curriculumApi } from '../../../curriculum/services/curriculum.api';
import QuestionCreateDrawer from '../../../qa/components/question-create-drawer';
import QuestionDetailsDrawer from '../../../qa/components/question-details-drawer';
import { QaQueryKey } from '../../../qa/constants/qa-query-key';
import type {
  QuestionDetailModel,
  QuestionModel,
} from '../../../qa/models/question.model';
import { qaApi } from '../../../qa/services/qa.api';

export default function QaManagerPage() {
  const qc = useQueryClient();
  const [classId, setClassId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [detailsOpened, { open: openDetails, close: closeDetails }] =
    useDisclosure(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionDetailModel | null>(null);

  // Classes accessible (mine)
  const classesQuery = useQuery({
    queryKey: ['qa', 'classes'],
    queryFn: () => classesApi.mine({ page: 1 }),
  });
  const classOptions = (classesQuery.data?.data || []).map(
    (c: { id: string; name: string }) => ({
      value: c.id,
      label: c.name,
    }),
  );

  // Chapters once class selected
  const chaptersQuery = useQuery({
    enabled: !!classId,
    queryKey: classId
      ? ['qa', 'chapters', classId]
      : ['qa', 'chapters', 'none'],
    queryFn: () => curriculumApi.listChapters(classId!),
  });
  const chapterOptions = (chaptersQuery.data || []).map((ch: ChapterModel) => ({
    value: ch.id,
    label: ch.title,
  }));

  // Lessons once chapter selected
  const lessonsQuery = useQuery({
    enabled: !!classId && !!chapterId,
    queryKey:
      classId && chapterId
        ? ['qa', 'lessons', classId, chapterId]
        : ['qa', 'lessons', 'none'],
    queryFn: () => curriculumApi.listLessons(classId!, chapterId!),
  });
  const lessonOptions = (lessonsQuery.data || []).map((l: LessonModel) => ({
    value: l.id,
    label: l.title,
  }));

  // Questions list
  const questionsQuery = useQuery({
    enabled: !!classId && !!chapterId && !!lessonId,
    queryKey:
      classId && chapterId && lessonId
        ? QaQueryKey.questions(classId, chapterId, lessonId)
        : ['qa', 'questions', 'none'],
    queryFn: () => qaApi.listQuestions(classId!, chapterId!, lessonId!),
  });
  const questions = useMemo(() => {
    const list: QuestionModel[] = questionsQuery.data || [];
    if (!debouncedSearch.trim()) return list;
    const s = debouncedSearch.toLowerCase();
    return list.filter(
      (q) =>
        q.title.toLowerCase().includes(s) ||
        q.content.toLowerCase().includes(s),
    );
  }, [questionsQuery.data, debouncedSearch]);

  // Answers for selected question
  const answersQuery = useQuery({
    enabled: !!selectedQuestion && !!classId && !!chapterId && !!lessonId,
    queryKey:
      selectedQuestion && classId && chapterId && lessonId
        ? QaQueryKey.answers(classId, chapterId, lessonId, selectedQuestion.id)
        : ['qa', 'answers', 'none'],
    queryFn: () =>
      qaApi.listAnswers(classId!, chapterId!, lessonId!, selectedQuestion!.id),
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (payload: { title: string; content: string }) =>
      qaApi.createQuestion(classId!, chapterId!, lessonId!, payload),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã tạo',
        message: 'Tạo câu hỏi thành công',
        color: 'green',
      });
      await qc.invalidateQueries({
        queryKey:
          classId && chapterId && lessonId
            ? QaQueryKey.questions(classId, chapterId, lessonId)
            : undefined,
      });
      closeCreate();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không tạo được';
      notifications.show({ title: 'Lỗi', message: msg, color: 'red' });
    },
  });

  const createAnswerMutation = useMutation({
    mutationFn: async (content: string) =>
      qaApi.createAnswer(
        classId!,
        chapterId!,
        lessonId!,
        selectedQuestion!.id,
        { content },
      ),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã gửi',
        message: 'Trả lời đã được thêm',
        color: 'green',
      });
      await qc.invalidateQueries({
        queryKey:
          selectedQuestion && classId && chapterId && lessonId
            ? QaQueryKey.answers(
                classId,
                chapterId,
                lessonId,
                selectedQuestion.id,
              )
            : undefined,
      });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không gửi được';
      notifications.show({ title: 'Lỗi', message: msg, color: 'red' });
    },
  });

  const rows = questions.map((q) => (
    <Table.Tr key={q.id}>
      <Table.Td>
        <Text fw={500} size='sm'>
          {q.title}
        </Text>
        <Text size='xs' c='dimmed'>
          {q.content.slice(0, 80)}
          {q.content.length > 80 ? '…' : ''}
        </Text>
      </Table.Td>
      <Table.Td style={{ width: 80 }}>
        <Tooltip label='Chi tiết'>
          <ActionIcon
            variant='subtle'
            color='blue'
            onClick={async () => {
              // fetch detail
              try {
                const detail = await qaApi.getQuestion(
                  classId!,
                  chapterId!,
                  lessonId!,
                  q.id,
                );
                setSelectedQuestion(detail);
                openDetails();
              } catch (e) {
                const msg =
                  e instanceof Error ? e.message : 'Không tải được chi tiết';
                notifications.show({
                  title: 'Lỗi',
                  message: msg,
                  color: 'red',
                });
              }
            }}
          >
            <LuEye />
          </ActionIcon>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <div className='p-4 flex flex-col gap-y-3'>
      <Card withBorder>
        <Group gap='md' grow>
          <Select
            label='Lớp'
            placeholder='Chọn lớp'
            data={classOptions}
            value={classId}
            onChange={(v) => {
              setClassId(v);
              setChapterId(null);
              setLessonId(null);
            }}
            searchable
            nothingFoundMessage='Không có lớp'
          />
          <Select
            label='Chương'
            placeholder='Chọn chương'
            data={chapterOptions}
            value={chapterId}
            onChange={(v) => {
              setChapterId(v);
              setLessonId(null);
            }}
            disabled={!classId}
            searchable
            nothingFoundMessage='Không có chương'
          />
          <Select
            label='Bài học'
            placeholder='Chọn bài học'
            data={lessonOptions}
            value={lessonId}
            onChange={setLessonId}
            disabled={!chapterId}
            searchable
            nothingFoundMessage='Không có bài học'
          />
        </Group>
      </Card>

      <Group justify='space-between' align='center'>
        <TextInput
          placeholder='Tìm câu hỏi...'
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ maxWidth: 280 }}
          disabled={!lessonId}
        />
        <Button
          leftSection={<LuPlus />}
          onClick={openCreate}
          disabled={!lessonId}
        >
          Tạo câu hỏi
        </Button>
      </Group>

      <Card withBorder>
        <Table striped withTableBorder withRowBorders highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Câu hỏi</Table.Th>
              <Table.Th style={{ width: 80 }}>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Text c='dimmed' ta='center'>
                    {!lessonId
                      ? 'Chọn lớp/chương/bài học để xem câu hỏi'
                      : 'Không có câu hỏi'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <QuestionCreateDrawer
        opened={createOpened}
        onClose={closeCreate}
        loading={createQuestionMutation.status === 'pending'}
        onSubmit={(vals) => {
          if (!classId || !chapterId || !lessonId) return;
          createQuestionMutation.mutate(vals);
        }}
      />

      <QuestionDetailsDrawer
        opened={detailsOpened}
        question={selectedQuestion}
        answers={answersQuery.data || []}
        loadingAnswers={answersQuery.status === 'pending'}
        creatingAnswer={createAnswerMutation.status === 'pending'}
        onClose={() => {
          closeDetails();
          setSelectedQuestion(null);
        }}
        onCreateAnswer={(content) => {
          if (!selectedQuestion) return;
          createAnswerMutation.mutate(content);
        }}
      />
    </div>
  );
}
