import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Drawer,
  Group,
  Pagination,
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
import { LuCheck, LuPlus, LuUserMinus, LuX } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import { ClassesQueryKey } from '../../../../classes/constants/classes-query-key';
import { classesApi } from '../../../../classes/services/classes.api';

export default function ClassStudentsPage() {
  const { id } = useParams();
  const [status, setStatus] = useState<'pending' | 'approved' | 'all'>('all');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);

  const { data } = useQuery({
    enabled: !!id,
    queryKey: id
      ? ClassesQueryKey.students(id, { page, status })
      : ['classes', 'students', 'none'],
    queryFn: async () => {
      if (!id) return Promise.resolve(null);
      return classesApi.listStudents(id, {
        page,
        status: status === 'all' ? undefined : status,
      });
    },
  });

  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
  const list = useMemo(
    () =>
      (data?.data as Array<{
        studentId: string;
        status: 'pending' | 'approved';
        student: {
          id: string;
          name: string | null;
          email: string;
          image?: string | null;
        };
      }>) ?? [],
    [data?.data],
  );

  const approveMutation = useMutation({
    mutationFn: async (studentId: string) =>
      classesApi.approveStudent(id!, studentId),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã duyệt',
        message: 'Yêu cầu tham gia đã được duyệt',
        color: 'green',
      });
      await qc.invalidateQueries({
        queryKey: id
          ? ClassesQueryKey.students(id, { page, status })
          : undefined,
      });
    },
    onError: (err: unknown) =>
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không duyệt được',
        color: 'red',
      }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (studentId: string) =>
      classesApi.rejectStudent(id!, studentId),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã từ chối',
        message: 'Đã từ chối yêu cầu tham gia',
        color: 'green',
      });
      await qc.invalidateQueries({
        queryKey: id
          ? ClassesQueryKey.students(id, { page, status })
          : undefined,
      });
    },
    onError: (err: unknown) =>
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không từ chối được',
        color: 'red',
      }),
  });

  const kickMutation = useMutation({
    mutationFn: async (studentId: string) =>
      classesApi.kickStudent(id!, studentId),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã kích',
        message: 'Đã xóa học sinh khỏi lớp',
        color: 'green',
      });
      await qc.invalidateQueries({
        queryKey: id
          ? ClassesQueryKey.students(id, { page, status })
          : undefined,
      });
    },
    onError: (err: unknown) =>
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không kích được',
        color: 'red',
      }),
  });

  const availableQuery = useQuery({
    enabled: addOpened && !!id,
    queryKey: ['classes', 'available-students', id, { search: debounced }],
    queryFn: async () =>
      id ? classesApi.listAvailableStudents(id, { search: debounced }) : null,
  });

  // Add student action (admin/teacher)
  const addMutation = useMutation({
    mutationFn: async (studentId: string) =>
      classesApi.addStudent(id!, { studentId }),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã thêm',
        message: 'Đã thêm học sinh vào lớp',
        color: 'green',
      });
      await qc.invalidateQueries({
        queryKey: id
          ? ClassesQueryKey.students(id, { page, status })
          : undefined,
      });
      closeAdd();
    },
    onError: (err: unknown) =>
      notifications.show({
        title: 'Lỗi',
        message: err instanceof Error ? err.message : 'Không thêm được',
        color: 'red',
      }),
  });

  const rows = useMemo(
    () =>
      list.map(
        (s: {
          studentId: string;
          status: 'pending' | 'approved';
          student: {
            id: string;
            name: string | null;
            email: string;
            image?: string | null;
          };
        }) => (
          <Table.Tr key={s.studentId}>
            <Table.Td>
              <Group gap='sm'>
                <Avatar radius='xl' color='blue'>
                  {(s.student.name || s.student.email || '?')
                    .slice(0, 1)
                    .toUpperCase()}
                </Avatar>
                <div>
                  <Text fw={500} size='sm'>
                    {s.student.name || s.student.email}
                  </Text>
                  <Text size='xs' c='dimmed'>
                    {s.student.email}
                  </Text>
                </div>
              </Group>
            </Table.Td>
            <Table.Td>
              {s.status === 'approved' ? (
                <Badge color='green' variant='light'>
                  Đã duyệt
                </Badge>
              ) : (
                <Badge color='yellow' variant='light'>
                  Chờ duyệt
                </Badge>
              )}
            </Table.Td>
            <Table.Td>
              <Group gap='xs'>
                {s.status === 'pending' && (
                  <>
                    <Tooltip label='Duyệt'>
                      <ActionIcon
                        color='green'
                        variant='subtle'
                        onClick={() => approveMutation.mutate(s.studentId)}
                      >
                        <LuCheck />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label='Từ chối'>
                      <ActionIcon
                        color='red'
                        variant='subtle'
                        onClick={() => rejectMutation.mutate(s.studentId)}
                      >
                        <LuX />
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}
                {s.status === 'approved' && (
                  <Tooltip label='Kích khỏi lớp'>
                    <ActionIcon
                      color='red'
                      variant='subtle'
                      onClick={() => kickMutation.mutate(s.studentId)}
                    >
                      <LuUserMinus />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Table.Td>
          </Table.Tr>
        ),
      ),
    [list, approveMutation, rejectMutation, kickMutation],
  );

  return (
    <div className='flex flex-col gap-3'>
      <Group justify='space-between'>
        <Group>
          <Select
            data={[
              { value: 'all', label: 'Tất cả' },
              { value: 'pending', label: 'Chờ duyệt' },
              { value: 'approved', label: 'Đã duyệt' },
            ]}
            value={status}
            onChange={(v) =>
              setStatus((v as 'all' | 'pending' | 'approved') ?? 'all')
            }
          />
        </Group>
        <Button leftSection={<LuPlus />} onClick={openAdd}>
          Thêm học sinh
        </Button>
      </Group>
      <Table striped withTableBorder withRowBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Học sinh</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th style={{ width: 160 }}>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text c='dimmed' ta='center'>
                  Không có dữ liệu
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
      <Group justify='space-between' mt='md'>
        <Text size='sm' c='dimmed'>
          Tổng: {meta.total ?? list.length}
        </Text>
        <Pagination
          total={meta.totalPages ?? 1}
          value={page}
          onChange={setPage}
        />
      </Group>

      <Drawer
        opened={addOpened}
        onClose={closeAdd}
        title='Thêm học sinh'
        position='right'
        size='md'
      >
        <TextInput
          placeholder='Tìm theo tên/email'
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          mb='sm'
        />
        <div className='mt-2 max-h-80 overflow-auto'>
          {availableQuery.data?.data?.length ? (
            availableQuery.data.data.map(
              (u: { id: string; name: string | null; email: string }) => (
                <Group
                  key={u.id}
                  justify='space-between'
                  className='px-2 py-2 border-b'
                >
                  <Group>
                    <Avatar radius='xl' size='sm' color='blue'>
                      {(u.name || u.email || '?').slice(0, 1).toUpperCase()}
                    </Avatar>
                    <div>
                      <Text size='sm'>{u.name || u.email}</Text>
                      <Text size='xs' c='dimmed'>
                        {u.email}
                      </Text>
                    </div>
                  </Group>
                  <Button
                    size='xs'
                    onClick={() => addMutation.mutate(u.id)}
                    loading={addMutation.status === 'pending'}
                  >
                    Thêm
                  </Button>
                </Group>
              ),
            )
          ) : (
            <p>Không có kết quả</p>
          )}
        </div>
      </Drawer>
    </div>
  );
}
