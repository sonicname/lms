import {
  ActionIcon,
  Button,
  Drawer,
  Group,
  Modal,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { LuFolderPlus, LuPlus, LuTrash2 } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import { accountApi } from '../../../../accounts/services/account.api';
// import { assetsApi } from '../../../../assets/services/assets.api';
import { classesApi } from '../../../../classes/services/classes.api';
import { TestsQueryKey } from '../../../../tests/constants/tests-query-key';
import type {
  CreateTestModel,
  TestModel,
} from '../../../../tests/models/test.model';
import { testsApi } from '../../../../tests/services/tests.api';

export default function ClassTestsPage() {
  const { id: classId } = useParams();
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
              >
                <LuFolderPlus />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label='Xoá (chưa hỗ trợ)'>
            <ActionIcon variant='subtle' color='red' disabled>
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
          <MultiSelect
            label='Tag (tên)'
            data={tagNames.map((t) => ({ value: t, label: t }))}
            value={tagNames}
            onChange={setTagNames}
            searchable
            placeholder='Nhập hoặc chọn tag'
          />
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

  const listQuery = useQuery({
    enabled: opened && !!testId,
    queryKey: ['essay-questions', { classId, testId }],
    queryFn: async () =>
      testId ? testsApi.listEssayQuestions(classId, testId) : [],
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

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title='Câu hỏi tự luận'
      position='right'
      size='md'
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
        <Table striped withRowBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Thứ tự</Table.Th>
              <Table.Th>Nội dung</Table.Th>
              <Table.Th style={{ width: 80 }}>Xoá</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(listQuery.data || []).map((q) => (
              <Table.Tr key={q.id}>
                <Table.Td>{q.displayOrder}</Table.Td>
                <Table.Td>
                  {q.prompt || <Text c='dimmed'>Không có nội dung</Text>}
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    color='red'
                    variant='subtle'
                    onClick={() => deleteMutation.mutate(q.id)}
                  >
                    <LuTrash2 />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
            {!listQuery.data?.length && (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c='dimmed' ta='center'>
                    Chưa có câu hỏi
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
