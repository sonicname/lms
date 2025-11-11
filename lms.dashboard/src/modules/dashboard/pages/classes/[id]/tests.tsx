import {
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
  Checkbox,
  Drawer,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Table,
  TagsInput,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import {
  LuCheck,
  LuFolderPlus,
  LuGripVertical,
  LuPaperclip,
  LuPencil,
  LuPlus,
  LuTrash2,
  LuX,
} from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import { accountApi } from '../../../../accounts/services/account.api';
import type {
  AssetModel,
  ListAssetModel,
} from '../../../../assets/models/asset.model';
import { assetsApi } from '../../../../assets/services/assets.api';
// import { assetsApi } from '../../../../assets/services/assets.api';
import { useAuthStore } from '../../../../auth/stores/auth-store';
import { classesApi } from '../../../../classes/services/classes.api';
import { quizzApi } from '../../../../quizz/services/quizz.api';
import { TestsQueryKey } from '../../../../tests/constants/tests-query-key';
import type {
  CreateTestModel,
  TestModel,
} from '../../../../tests/models/test.model';
import { testsApi } from '../../../../tests/services/tests.api';

function TagsSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const { data: allTags, isLoading } = useQuery({
    queryKey: ['all-quiz-tags'],
    queryFn: quizzApi.listAllTags,
  });
  const suggestions = (allTags || [])
    .map((t) => t.name)
    .filter((n) => !value.includes(n));
  return (
    <TagsInput
      label='Tag (tên)'
      value={value}
      onChange={onChange}
      data={suggestions}
      clearable
      placeholder={isLoading ? 'Đang tải tag...' : 'Nhập hoặc chọn tag'}
      splitChars={[',']}
    />
  );
}

export default function ClassTestsPage() {
  const { id: classId } = useParams();
  const { getCurrentUserRole } = useAuthStore();
  const currentUserRole = getCurrentUserRole();
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  // Removed legacy asset attach (replaced by import & essay management)
  const [importOpened, { open: openImport, close: closeImport }] =
    useDisclosure(false);
  const [essayOpened, { open: openEssay, close: closeEssay }] =
    useDisclosure(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  // Track currently managed test type (removed, not needed)
  // Legacy state removed
  // Legacy selected assets removed
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [points, setPoints] = useState<number | ''>(1);
  const [startOrder, setStartOrder] = useState<number | ''>('');
  const qc = useQueryClient();

  const {
    data: tests,
    isLoading: testsLoading,
    error: testsError,
  } = useQuery({
    enabled: !!classId,
    queryKey: classId ? TestsQueryKey.list(classId) : ['tests', 'none'],
    queryFn: async () => (classId ? testsApi.list(classId) : []),
  });

  // Removed legacy assets query
  // Legacy assetOptions removed
  // no-op

  const createMutation = useMutation({
    mutationFn: async (payload: CreateTestModel) =>
      testsApi.create(classId!, payload),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã tạo',
        message: 'Tạo bài kiểm tra thành công',
        color: 'green',
      });
      await qc.invalidateQueries({
        queryKey: classId ? TestsQueryKey.list(classId) : undefined,
      });
      closeCreate();
      setTestName('');
      setStartDate(null);
      setEndDate(null);
    },
    onError: (err: unknown) => {
      // Attempt to extract server error message if available
      const axiosLike = err as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const serverMsg = axiosLike?.response?.data?.message;
      const msg = Array.isArray(serverMsg)
        ? serverMsg.join(', ')
        : serverMsg || axiosLike?.message || 'Không tạo được';
      notifications.show({ title: 'Lỗi', message: msg, color: 'red' });
    },
  });

  // Removed attachMutation logic (deprecated)

  const deleteTestMutation = useMutation({
    mutationFn: async (testId: string) => testsApi.delete(classId!, testId),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã xoá',
        message: 'Đã xoá bài kiểm tra',
        color: 'green',
      });
      await qc.invalidateQueries({
        queryKey: classId ? TestsQueryKey.list(classId) : undefined,
      });
    },
    onError: (err: unknown) => {
      const axiosLike = err as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const serverMsg = axiosLike?.response?.data?.message;
      const msg = Array.isArray(serverMsg)
        ? serverMsg.join(', ')
        : serverMsg || axiosLike?.message || 'Không xoá được';
      notifications.show({ title: 'Lỗi', message: msg, color: 'red' });
    },
  });

  const rows = (tests || []).map((t: TestModel) => (
    <Table.Tr key={t.id}>
      <Table.Td>
        <Text fw={500} size='sm'>
          {t.name}
        </Text>
        <Text size='xs' c='dimmed'>
          {t.startDate
            ? `Bắt đầu: ${new Date(t.startDate).toLocaleString()}`
            : 'Không thời gian bắt đầu'}
        </Text>
        <Text size='xs' c='dimmed'>
          {t.endDate
            ? `Kết thúc: ${new Date(t.endDate).toLocaleString()}`
            : 'Không thời gian kết thúc'}
        </Text>
        <Text size='xs' c='dimmed'>
          Loại: {t.type === 'essay' ? 'Tự luận' : 'Trắc nghiệm'}
        </Text>
      </Table.Td>
      <Table.Td style={{ width: 140 }}>
        <Group gap='xs'>
          {t.type === 'essay' ? (
            <Tooltip label='Quản lý câu hỏi tự luận'>
              <ActionIcon
                variant='subtle'
                color='violet'
                onClick={() => {
                  setSelectedTestId(t.id);
                  openEssay();
                }}
                disabled={currentUserRole !== 'teacher'}
              >
                <LuFolderPlus />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Tooltip label='Nhập câu hỏi theo Tag'>
              <ActionIcon
                variant='subtle'
                color='indigo'
                onClick={() => {
                  setSelectedTestId(t.id);
                  openImport();
                }}
                disabled={currentUserRole !== 'teacher'}
              >
                <LuFolderPlus />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label='Xoá bài kiểm tra'>
            <ActionIcon
              variant='subtle'
              color='red'
              onClick={() => {
                if (currentUserRole !== 'teacher') return;
                const confirmed = window.confirm(
                  'Bạn chắc chắn muốn xoá bài kiểm tra này?',
                );
                if (!confirmed) return;
                deleteTestMutation.mutate(t.id);
              }}
              loading={deleteTestMutation.status === 'pending'}
              disabled={currentUserRole !== 'teacher'}
            >
              <LuTrash2 />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const [testName, setTestName] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [type, setType] = useState<'essay' | 'mcq'>('mcq');

  // Ownership & role checks
  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: accountApi.getCurrentAccount,
  });
  const { data: classDetail } = useQuery({
    enabled: !!classId,
    queryKey: ['class', classId],
    queryFn: async () => classesApi.getOne(classId!),
  });

  const canCreate = useMemo(() => {
    if (!me || !classDetail) return false;
    // Only teacher owning the class can create (backend constraint)
    return me.role === 'teacher' && classDetail.teacherId === me.id;
  }, [me, classDetail]);

  return (
    <div className='flex flex-col gap-3'>
      <Group justify='space-between'>
        <Text fw={600}>Bài kiểm tra</Text>
        <Button
          leftSection={<LuPlus />}
          onClick={openCreate}
          disabled={!canCreate}
          variant={canCreate ? 'filled' : 'default'}
        >
          Tạo bài kiểm tra
        </Button>
      </Group>
      {!canCreate && (
        <Text size='xs' c='dimmed'>
          Chỉ giáo viên sở hữu lớp mới có thể tạo bài kiểm tra.
        </Text>
      )}

      <Table striped withTableBorder withRowBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Thông tin</Table.Th>
            <Table.Th style={{ width: 140 }}>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {testsLoading && (
            <Table.Tr>
              <Table.Td colSpan={2}>
                <Text c='dimmed' ta='center'>
                  Đang tải...
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
          {testsError && !testsLoading && (
            <Table.Tr>
              <Table.Td colSpan={2}>
                <Text c='red' ta='center'>
                  Lỗi tải danh sách bài kiểm tra
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
          {!testsLoading &&
            !testsError &&
            (rows.length ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Text c='dimmed' ta='center'>
                    Chưa có bài kiểm tra
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
        </Table.Tbody>
      </Table>

      <Drawer
        opened={createOpened}
        onClose={closeCreate}
        title='Tạo bài kiểm tra'
        position='right'
        size='md'
      >
        <Stack gap='md'>
          <TextInput
            label='Tên'
            placeholder='Nhập tên'
            value={testName}
            onChange={(e) => setTestName(e.currentTarget.value)}
          />
          <Select
            label='Loại bài kiểm tra'
            value={type}
            onChange={(v) => setType((v as 'essay' | 'mcq') || 'mcq')}
            data={[
              { value: 'mcq', label: 'Trắc nghiệm' },
              { value: 'essay', label: 'Tự luận' },
            ]}
          />
          <DateTimePicker
            label='Thời gian bắt đầu'
            value={startDate}
            onChange={(d) => setStartDate(d as Date | null)}
            clearable
          />
          <DateTimePicker
            label='Thời gian kết thúc'
            value={endDate}
            onChange={(d) => setEndDate(d as Date | null)}
            clearable
          />
          <Group justify='flex-end'>
            <Button variant='default' onClick={closeCreate}>
              Huỷ
            </Button>
            <Button
              onClick={() => {
                if (!canCreate) {
                  notifications.show({
                    title: 'Không được phép',
                    message: 'Bạn không thể tạo bài kiểm tra cho lớp này.',
                    color: 'red',
                  });
                  return;
                }
                if (!testName.trim()) {
                  notifications.show({
                    title: 'Thiếu tên',
                    message: 'Tên không được trống',
                    color: 'yellow',
                  });
                  return;
                }
                if (!classId) {
                  notifications.show({
                    title: 'Thiếu classId',
                    message: 'Không xác định được lớp học.',
                    color: 'red',
                  });
                  return;
                }
                createMutation.mutate({
                  name: testName.trim(),
                  type,
                  startDate: startDate ? dayjs(startDate).toISOString() : null,
                  endDate: endDate ? dayjs(endDate).toISOString() : null,
                });
              }}
              loading={createMutation.status === 'pending'}
              disabled={createMutation.status === 'pending' || !canCreate}
            >
              Tạo
            </Button>
          </Group>
        </Stack>
      </Drawer>

      {/* Import by tags for MCQ */}
      <Modal
        opened={importOpened}
        onClose={() => {
          closeImport();
          setTagNames([]);
          setPoints(1);
          setStartOrder('');
        }}
        title='Nhập câu hỏi theo Tag'
        size='lg'
      >
        <Stack gap='md'>
          <TagsSelect value={tagNames} onChange={setTagNames} />
          <NumberInput
            label='Điểm mỗi câu'
            value={points}
            onChange={(v) => setPoints(typeof v === 'number' ? v : 1)}
            min={0}
            step={0.5}
            allowDecimal
          />
          <NumberInput
            label='Vị trí bắt đầu'
            value={startOrder}
            onChange={(v) => setStartOrder(typeof v === 'number' ? v : '')}
            min={1}
          />
          <Group justify='flex-end'>
            <Button
              variant='default'
              onClick={() => {
                closeImport();
              }}
            >
              Huỷ
            </Button>
            <Button
              onClick={async () => {
                if (!classId || !selectedTestId) return;
                if (!tagNames.length) {
                  notifications.show({
                    title: 'Thiếu tag',
                    message: 'Nhập ít nhất 1 tag',
                    color: 'yellow',
                  });
                  return;
                }
                try {
                  const res = await testsApi.importByTags(
                    classId,
                    selectedTestId,
                    {
                      tagNames,
                      points: points === '' ? null : Number(points),
                      startOrder: startOrder === '' ? null : Number(startOrder),
                    },
                  );
                  notifications.show({
                    title: 'Đã nhập',
                    message: `Đã thêm ${res?.inserted ?? ''} câu hỏi`,
                    color: 'green',
                  });
                  closeImport();
                } catch (err) {
                  const axiosLike = err as {
                    response?: { data?: { message?: string | string[] } };
                    message?: string;
                  };
                  const serverMsg = axiosLike?.response?.data?.message;
                  const msg = Array.isArray(serverMsg)
                    ? serverMsg.join(', ')
                    : serverMsg || axiosLike?.message || 'Không nhập được';
                  notifications.show({
                    title: 'Lỗi',
                    message: msg,
                    color: 'red',
                  });
                }
              }}
            >
              Nhập
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Essay questions manager (minimal) */}
      <EssayQuestionsDrawer
        opened={essayOpened}
        onClose={() => {
          closeEssay();
          setSelectedTestId(null);
        }}
        classId={classId!}
        testId={selectedTestId}
      />
    </div>
  );
}

function EssayQuestionsDrawer({
  opened,
  onClose,
  classId,
  testId,
}: {
  opened: boolean;
  onClose: () => void;
  classId: string;
  testId: string | null;
}) {
  const qc = useQueryClient();
  const [prompt, setPrompt] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editDisplayOrder, setEditDisplayOrder] = useState<number | ''>('');
  // Asset attach modal state
  const [assetModalQuestionId, setAssetModalQuestionId] = useState<
    string | null
  >(null);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [assetSearch, setAssetSearch] = useState('');
  const [assetPage, setAssetPage] = useState(1);
  const [reorderActive, setReorderActive] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  // For local reorder state
  type EssayQuestionRow = {
    id: string;
    prompt: string | null;
    displayOrder: number;
    assets?: Array<{
      id: string;
      url: string;
      filename: string;
      mimetype: string;
    }>;
  };
  const [localQuestions, setLocalQuestions] = useState<EssayQuestionRow[]>([]);

  const listQuery = useQuery<EssayQuestionRow[]>({
    enabled: opened && !!testId,
    queryKey: ['essay-questions', { classId, testId }],
    queryFn: async () =>
      testId ? testsApi.listEssayQuestions(classId, testId) : [],
  });
  // sync local on data change
  useEffect(() => {
    if (listQuery.data) setLocalQuestions(listQuery.data as EssayQuestionRow[]);
  }, [listQuery.data]);

  // Assets listing for picker
  const assetsQuery = useQuery<ListAssetModel>({
    enabled: !!assetModalQuestionId,
    queryKey: ['assets', { page: assetPage, search: assetSearch }],
    queryFn: async () =>
      assetsApi.list({ page: assetPage, limit: 10, search: assetSearch }),
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      testsApi.createEssayQuestion(classId, testId!, {
        prompt: prompt || undefined,
        displayOrder: displayOrder === '' ? undefined : Number(displayOrder),
      }),
    onSuccess: async () => {
      setPrompt('');
      setDisplayOrder('');
      await qc.invalidateQueries({
        queryKey: ['essay-questions', { classId, testId }],
      });
      notifications.show({
        title: 'Đã tạo',
        message: 'Đã thêm câu hỏi',
        color: 'green',
      });
    },
    onError: (err: unknown) => {
      const axiosLike = err as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const serverMsg = axiosLike?.response?.data?.message;
      const msg = Array.isArray(serverMsg)
        ? serverMsg.join(', ')
        : serverMsg || axiosLike?.message || 'Không tạo được';
      notifications.show({ title: 'Lỗi', message: msg, color: 'red' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (qid: string) =>
      testsApi.deleteEssayQuestion(classId, testId!, qid),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ['essay-questions', { classId, testId }],
      });
      notifications.show({
        title: 'Đã xoá',
        message: 'Đã xoá câu hỏi',
        color: 'green',
      });
    },
    onError: () =>
      notifications.show({
        title: 'Lỗi',
        message: 'Không xoá được',
        color: 'red',
      }),
  });

  const updateMutation = useMutation({
    mutationFn: async () =>
      testsApi.updateEssayQuestion(classId, testId!, editingId!, {
        prompt: editPrompt || undefined,
        displayOrder:
          editDisplayOrder === '' ? undefined : Number(editDisplayOrder),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ['essay-questions', { classId, testId }],
      });
      notifications.show({
        title: 'Đã cập nhật',
        message: 'Đã lưu câu hỏi',
        color: 'green',
      });
      setEditingId(null);
      setEditPrompt('');
      setEditDisplayOrder('');
    },
    onError: () =>
      notifications.show({
        title: 'Lỗi',
        message: 'Không cập nhật được',
        color: 'red',
      }),
  });

  const attachAssetsMutation = useMutation({
    mutationFn: async () =>
      testsApi.attachEssayQuestionAssets(
        classId,
        testId!,
        assetModalQuestionId!,
        selectedAssetIds,
      ),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ['essay-questions', { classId, testId }],
      });
      notifications.show({
        title: 'Đã đính kèm',
        message: 'Đã gán nội dung cho câu hỏi',
        color: 'green',
      });
      setAssetModalQuestionId(null);
      setSelectedAssetIds([]);
    },
    onError: (err: unknown) => {
      const axiosLike = err as {
        response?: { data?: { message?: string | string[] } };
        message?: string;
      };
      const serverMsg = axiosLike?.response?.data?.message;
      const msg = Array.isArray(serverMsg)
        ? serverMsg.join(', ')
        : serverMsg || axiosLike?.message || 'Không đính kèm được';
      notifications.show({ title: 'Lỗi', message: msg, color: 'red' });
    },
  });

  // DnD reorder handled in DndContext onDragEnd

  const persistReorder = async () => {
    if (!testId) return;
    const original = (listQuery.data || []) as Array<{ displayOrder: number }>;
    const changed = localQuestions.filter(
      (q, i) => q.displayOrder !== original[i]?.displayOrder,
    );
    for (const q of changed) {
      try {
        await testsApi.updateEssayQuestion(classId, testId, q.id, {
          displayOrder: q.displayOrder,
        });
      } catch {
        notifications.show({
          title: 'Lỗi',
          message: 'Không lưu thứ tự',
          color: 'red',
        });
        return;
      }
    }
    await qc.invalidateQueries({
      queryKey: ['essay-questions', { classId, testId }],
    });
    notifications.show({
      title: 'Đã lưu',
      message: 'Đã cập nhật thứ tự',
      color: 'green',
    });
    setReorderActive(false);
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title='Câu hỏi tự luận'
      position='right'
      size='lg'
    >
      <Stack gap='md'>
        <TextInput
          label='Nội dung'
          value={prompt}
          onChange={(e) => setPrompt(e.currentTarget.value)}
        />
        <NumberInput
          label='Thứ tự hiển thị'
          value={displayOrder}
          onChange={(v) => setDisplayOrder(typeof v === 'number' ? v : '')}
          min={1}
        />
        <Group justify='flex-end'>
          <Button variant='default' onClick={onClose}>
            Đóng
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            loading={createMutation.status === 'pending'}
          >
            Thêm
          </Button>
        </Group>
        <Group justify='space-between'>
          <Text size='sm' fw={500}>
            Danh sách câu hỏi
          </Text>
          <Group gap={8}>
            <Button
              size='xs'
              variant={reorderActive ? 'filled' : 'light'}
              onClick={() => setReorderActive((r) => !r)}
            >
              {reorderActive ? 'Thoát sắp xếp' : 'Sắp xếp nhanh'}
            </Button>
            {reorderActive && (
              <Button size='xs' color='green' onClick={persistReorder}>
                Lưu thứ tự
              </Button>
            )}
          </Group>
        </Group>
        <Table striped withRowBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 70 }}>Thứ tự</Table.Th>
              <Table.Th>Nội dung</Table.Th>
              <Table.Th>Tập tin</Table.Th>
              <Table.Th style={{ width: 120 }}>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {reorderActive ? (
              <DndContext
                sensors={sensors}
                onDragEnd={(e: DragEndEvent) => {
                  const { active, over } = e;
                  if (!over || active.id === over.id) return;
                  const oldIndex = localQuestions.findIndex(
                    (x) => x.id === active.id,
                  );
                  const newIndex = localQuestions.findIndex(
                    (x) => x.id === over.id,
                  );
                  if (oldIndex === -1 || newIndex === -1) return;
                  const moved = arrayMove(
                    localQuestions,
                    oldIndex,
                    newIndex,
                  ).map((q, i) => ({ ...q, displayOrder: i + 1 }));
                  setLocalQuestions(moved);
                }}
              >
                <SortableContext
                  items={localQuestions.map((x) => x.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {localQuestions.map((q) => (
                    <SortableRow key={q.id} q={q} />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              (listQuery.data || []).map((q) => (
                <Table.Tr key={q.id}>
                  <Table.Td>{q.displayOrder}</Table.Td>
                  <Table.Td>
                    {editingId === q.id ? (
                      <TextInput
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.currentTarget.value)}
                        placeholder='Nội dung'
                        size='xs'
                      />
                    ) : q.prompt ? (
                      q.prompt
                    ) : (
                      <Text c='dimmed'>Không có nội dung</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {q.assets?.length ? (
                        q.assets.map((a: { id: string; filename: string }) => (
                          <Badge key={a.id} color='blue' variant='light'>
                            {a.filename}
                          </Badge>
                        ))
                      ) : (
                        <Text c='dimmed' size='xs'>
                          Chưa có
                        </Text>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {editingId === q.id ? (
                      <Group gap={4}>
                        <ActionIcon
                          color='green'
                          variant='subtle'
                          onClick={() => updateMutation.mutate()}
                          loading={updateMutation.status === 'pending'}
                        >
                          <LuCheck />
                        </ActionIcon>
                        <ActionIcon
                          color='gray'
                          variant='subtle'
                          onClick={() => {
                            setEditingId(null);
                            setEditPrompt('');
                            setEditDisplayOrder('');
                          }}
                        >
                          <LuX />
                        </ActionIcon>
                      </Group>
                    ) : (
                      <Group gap={4}>
                        <ActionIcon
                          color='violet'
                          variant='subtle'
                          onClick={() => {
                            setEditingId(q.id);
                            setEditPrompt(q.prompt || '');
                            setEditDisplayOrder(q.displayOrder);
                          }}
                        >
                          <LuPencil />
                        </ActionIcon>
                        <ActionIcon
                          color='indigo'
                          variant='subtle'
                          onClick={() => {
                            setAssetModalQuestionId(q.id);
                            setSelectedAssetIds([]);
                          }}
                        >
                          <LuPaperclip />
                        </ActionIcon>
                        <ActionIcon
                          color='red'
                          variant='subtle'
                          onClick={() => deleteMutation.mutate(q.id)}
                        >
                          <LuTrash2 />
                        </ActionIcon>
                      </Group>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))
            )}
            {!listQuery.data?.length && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c='dimmed' ta='center'>
                    Chưa có câu hỏi
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        <Modal
          opened={!!assetModalQuestionId}
          onClose={() => {
            setAssetModalQuestionId(null);
            setSelectedAssetIds([]);
            setAssetSearch('');
            setAssetPage(1);
          }}
          title='Đính kèm nội dung'
          size='lg'
        >
          <Stack gap='sm'>
            <TextInput
              placeholder='Tìm kiếm tên file'
              value={assetSearch}
              onChange={(e) => {
                setAssetSearch(e.currentTarget.value);
                setAssetPage(1);
              }}
            />
            <Stack
              gap={4}
              style={{
                maxHeight: 300,
                overflowY: 'auto',
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: 4,
                padding: 8,
              }}
            >
              {assetsQuery.isLoading && (
                <Text c='dimmed' size='sm'>
                  Đang tải...
                </Text>
              )}
              {assetsQuery.data?.data?.map((a: AssetModel) => {
                const checked = selectedAssetIds.includes(a.id);
                return (
                  <Group key={a.id} gap={8} wrap='nowrap'>
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
                        setSelectedAssetIds((ids) =>
                          e.currentTarget.checked
                            ? [...ids, a.id]
                            : ids.filter((x) => x !== a.id),
                        );
                      }}
                      size='xs'
                    />
                    <Text size='xs' style={{ flex: 1 }}>
                      {a.filename}
                    </Text>
                    <Badge size='xs' color='gray'>
                      {a.fileType}
                    </Badge>
                  </Group>
                );
              })}
              {!assetsQuery.isLoading && !assetsQuery.data?.data?.length && (
                <Text c='dimmed' size='xs' ta='center'>
                  Không có tài nguyên
                </Text>
              )}
            </Stack>
            <Group justify='space-between'>
              <Group gap={4}>
                <Button
                  size='xs'
                  variant='default'
                  disabled={assetPage === 1}
                  onClick={() => setAssetPage((p) => Math.max(1, p - 1))}
                >
                  Trước
                </Button>
                <Button
                  size='xs'
                  variant='default'
                  onClick={() => setAssetPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </Group>
              <Group gap={8}>
                <Button
                  size='xs'
                  variant='default'
                  onClick={() => {
                    setAssetModalQuestionId(null);
                    setSelectedAssetIds([]);
                  }}
                >
                  Đóng
                </Button>
                <Button
                  size='xs'
                  color='indigo'
                  onClick={() => attachAssetsMutation.mutate()}
                  loading={attachAssetsMutation.status === 'pending'}
                  disabled={!selectedAssetIds.length}
                >
                  Gán
                </Button>
              </Group>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Drawer>
  );
}

function SortableRow({
  q,
}: {
  q: {
    id: string;
    displayOrder: number;
    prompt: string | null;
    assets?: Array<{ id: string; filename: string }>;
  };
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: q.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  } as React.CSSProperties;
  return (
    <Table.Tr ref={setNodeRef} style={style} {...attributes}>
      <Table.Td>
        <Group gap={6} wrap='nowrap'>
          <ActionIcon variant='subtle' size='sm' {...listeners}>
            <LuGripVertical />
          </ActionIcon>
          {q.displayOrder}
        </Group>
      </Table.Td>
      <Table.Td>
        {q.prompt || <Text c='dimmed'>Không có nội dung</Text>}
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          {q.assets?.length ? (
            q.assets.map((a) => (
              <Badge key={a.id} color='blue' variant='light'>
                {a.filename}
              </Badge>
            ))
          ) : (
            <Text c='dimmed' size='xs'>
              Chưa có
            </Text>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        <Text c='dimmed' size='xs'>
          Sắp xếp đang bật
        </Text>
      </Table.Td>
    </Table.Tr>
  );
}
