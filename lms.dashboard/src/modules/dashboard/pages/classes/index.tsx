import {
  ActionIcon,
  Button,
  Drawer,
  Flex,
  Group,
  Image,
  Pagination,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import SkeletonCard from '../../../../components/skeleton-card';
import ClassCreateForm from '../../../classes/components/class-create-form';
import ClassDeleteModal from '../../../classes/components/class-delete-modal';
import ClassEditDrawer from '../../../classes/components/class-edit-drawer';
import { ClassesQueryKey } from '../../../classes/constants/classes-query-key';
import type { ClassModel } from '../../../classes/models/class.model';
import { classesApi } from '../../../classes/services/classes.api';

export default function ClassesManagerPage() {
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [editingClass, setEditingClass] = useState<ClassModel | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  // Reset to first page when raw search term changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ClassesQueryKey.list({ page, search: debouncedSearch }),
    queryFn: async () => classesApi.list({ page, search: debouncedSearch }),
  });

  const listData = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => classesApi.delete(id),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã xoá',
        message: 'Lớp đã bị xoá',
        color: 'green',
      });
      await qc.invalidateQueries({ queryKey: ClassesQueryKey.lists() });
      closeDelete();
      setSelectedClassId(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Không thể xoá lớp';
      notifications.show({ title: 'Lỗi', message, color: 'red' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (vars: {
      id: string;
      values: Partial<
        import('../../../classes/models/update-class.model').UpdateClassModel
      >;
    }) => classesApi.update(vars.id, vars.values),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã lưu',
        message: 'Cập nhật lớp thành công',
        color: 'green',
      });
      await qc.invalidateQueries({ queryKey: ClassesQueryKey.lists() });
      closeEdit();
      setEditingClass(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Không thể cập nhật lớp';
      notifications.show({ title: 'Lỗi', message, color: 'red' });
    },
  });

  const rows = useMemo(
    () =>
      listData.map((c: ClassModel) => (
        <Table.Tr key={c.id}>
          <Table.Td>
            <Group align='flex-start' gap='sm' wrap='nowrap'>
              {c.banners && c.banners.length ? (
                <Image
                  src={c.banners[0].url}
                  alt={c.banners[0].filename || 'banner'}
                  radius='sm'
                  w={64}
                  h={40}
                  fit='cover'
                />)
              : null}
              <div>
                <Text fw={500} fz='sm'>
                  {c.name}
                </Text>
                <Text fz='xs' c='dimmed'>
                  Mã: {c.code}
                </Text>
              </div>
            </Group>
          </Table.Td>
          <Table.Td>
            <ClassDescriptionCell description={c.description} />
          </Table.Td>
          <Table.Td>
            <Group gap='xs'>
              <Tooltip label='Xem chi tiết'>
                <ActionIcon
                  variant='subtle'
                  color='blue'
                  onClick={() => {
                    navigate(`/dashboard/classes/${c.id}`);
                  }}
                >
                  <LuEye />
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Chỉnh sửa'>
                <ActionIcon
                  variant='subtle'
                  color='teal'
                  onClick={() => {
                    setEditingClass(c);
                    openEdit();
                  }}
                >
                  <LuPencil />
                </ActionIcon>
              </Tooltip>
              <Tooltip label='Xoá'>
                <ActionIcon
                  variant='subtle'
                  color='red'
                  onClick={() => {
                    setSelectedClassId(c.id);
                    openDelete();
                  }}
                >
                  <LuTrash2 />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Table.Td>
        </Table.Tr>
      )),
    [listData, navigate, openEdit, openDelete],
  );

  if (isLoading) return <SkeletonCard isFullHeight lines={8} />;

  return (
    <div className='p-4 flex flex-col gap-y-2'>
      <Flex justify='space-between' align='center' mb='sm'>
        <TextInput
          placeholder='Tìm kiếm...'
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <Button onClick={openCreate}>Tạo lớp mới</Button>
      </Flex>
      <Table striped withTableBorder withRowBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Lớp học</Table.Th>
            <Table.Th>Mô tả</Table.Th>
            <Table.Th style={{ width: 140 }}>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text c='dimmed' ta='center'>
                  Không có lớp nào
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
      <Group justify='space-between' mt='md'>
        <Text size='sm' c='dimmed'>
          Tổng: {meta.total ?? listData.length}
        </Text>
        <Pagination
          total={meta.totalPages ?? 1}
          value={page}
          onChange={(p) => setPage(p)}
        />
      </Group>

      <Drawer
        opened={createOpened}
        onClose={closeCreate}
        title='Tạo lớp mới'
        position='right'
        size='lg'
      >
        <ClassCreateForm
          onCreated={async () => {
            await qc.invalidateQueries({ queryKey: ClassesQueryKey.lists() });
            closeCreate();
          }}
        />
      </Drawer>

      <ClassEditDrawer
        opened={editOpened}
        classData={
          editingClass
            ? {
                id: editingClass.id,
                name: editingClass.name,
                code: editingClass.code,
                description: editingClass.description,
              }
            : null
        }
        loading={updateMutation.status === 'pending'}
        onClose={() => {
          closeEdit();
          setEditingClass(null);
        }}
        onSubmit={(values) => {
          if (!editingClass?.id) return;
          updateMutation.mutate({ id: editingClass.id, values });
        }}
      />

      <ClassDeleteModal
        opened={deleteOpened}
        loading={deleteMutation.status === 'pending'}
        onClose={() => {
          closeDelete();
          setSelectedClassId(null);
        }}
        onConfirm={() =>
          selectedClassId && deleteMutation.mutate(selectedClassId)
        }
      />
    </div>
  );
}

function ClassDescriptionCell({ description }: { description: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!spanRef.current || expanded) return;
    const el = spanRef.current;
    // If content height (with clamp) > client height, we consider it overflow (> 2 lines)
    if (el.scrollHeight > el.clientHeight + 1) setHasOverflow(true);
    else setHasOverflow(false);
  }, [description, expanded]);

  if (!description) return <span>—</span>;
  return (
    <div>
      <span ref={spanRef} className={expanded ? undefined : 'line-clamp-2'}>
        {description}
      </span>
      {hasOverflow ? (
        <div>
          <Button
            variant='subtle'
            size='xs'
            onClick={() => setExpanded((e) => !e)}
            style={{ paddingLeft: 0 }}
          >
            {expanded ? 'Thu gọn' : 'Xem thêm'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
