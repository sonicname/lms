import {
  ActionIcon,
  Button,
  Card,
  Drawer,
  Group,
  Modal,
  MultiSelect,
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
import { useMemo, useState } from 'react';
import { LuFolderPlus, LuPlus, LuTrash2 } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import { accountApi } from '../../../../accounts/services/account.api';
import { assetsApi } from '../../../../assets/services/assets.api';
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
  const [attachOpened, { open: openAttach, close: closeAttach }] =
    useDisclosure(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
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

  const { data: assetsData } = useQuery({
    enabled: attachOpened && !!classId,
    queryKey: ['assets', 'teacher-owned', { classId, search: assetSearch }],
    queryFn: async () => assetsApi.list({ search: assetSearch, page: 1 }),
  });
  const assetOptions = (assetsData?.data || []).map(
    (a: { id: string; filename?: string; url?: string }) => ({
      value: a.id,
      label: a.filename || a.id,
    }),
  );

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

  const attachMutation = useMutation({
    mutationFn: async () =>
      testsApi.attachAssets(classId!, selectedTestId!, selectedAssets),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã gán',
        message: 'Gán nội dung thành công',
        color: 'green',
      });
      closeAttach();
      setSelectedAssets([]);
      setSelectedTestId(null);
    },
    onError: (err: unknown) =>
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không gán được',
        color: 'red',
      }),
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
      </Table.Td>
      <Table.Td style={{ width: 140 }}>
        <Group gap='xs'>
          <Tooltip label='Gán nội dung'>
            <ActionIcon
              variant='subtle'
              color='violet'
              onClick={() => {
                setSelectedTestId(t.id);
                openAttach();
              }}
            >
              <LuFolderPlus />
            </ActionIcon>
          </Tooltip>
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
      <Card withBorder>
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
      </Card>

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
                  startDate: startDate ? startDate.toISOString() : null,
                  endDate: endDate ? endDate.toISOString() : null,
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

      <Modal
        opened={attachOpened}
        onClose={closeAttach}
        title='Gán nội dung'
        size='lg'
      >
        <Stack gap='md'>
          <TextInput
            placeholder='Tìm nội dung'
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.currentTarget.value)}
          />
          <MultiSelect
            label='Chọn nội dung'
            data={assetOptions}
            value={selectedAssets}
            onChange={setSelectedAssets}
            searchable
            nothingFoundMessage='Không có nội dung'
            placeholder='Chọn assets...'
          />
          <Group justify='flex-end'>
            <Button variant='default' onClick={closeAttach}>
              Huỷ
            </Button>
            <Button
              onClick={() => {
                if (!selectedTestId) return;
                if (!selectedAssets.length) {
                  notifications.show({
                    title: 'Chưa chọn',
                    message: 'Chọn ít nhất 1 nội dung',
                    color: 'yellow',
                  });
                  return;
                }
                attachMutation.mutate();
              }}
              loading={attachMutation.status === 'pending'}
            >
              Gán
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
