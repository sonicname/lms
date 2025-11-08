import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Drawer,
  Flex,
  Group,
  Pagination,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
import SkeletonCard from '../../../../components/skeleton-card';
import AccountDeleteModal from '../../../accounts/components/account-delete-modal';
import AccountDetailsDrawer from '../../../accounts/components/account-details-drawer';
import AccountEditDrawer from '../../../accounts/components/account-edit-drawer';
import { UsersQueryKey } from '../../../accounts/constants/users-query-key';
import { useUsersFilter } from '../../../accounts/hooks/use-users-filter';
import type { UserModel } from '../../../accounts/models/user.model';
import { accountApi } from '../../../accounts/services/account.api';
import CreateAccountForm from '../../components/create-account-form';

type EditFormValues = {
  email: string;
  name: string;
  image: string;
  role: 'admin' | 'teacher' | 'student';
};

function asRole(role: string): 'admin' | 'teacher' | 'student' {
  if (role === 'admin' || role === 'teacher' || role === 'student') return role;
  return 'student';
}

function mapUserModel(u: UserModel): {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: 'admin' | 'teacher' | 'student';
} {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    image: u.image,
    role: asRole(u.role),
  };
}

export default function AccountManagerPage() {
  // const navigation = useNavigate(); // no longer used since create uses Drawer
  const { userFilter } = useUsersFilter();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] =
    useDisclosure(false);
  const [editingUser, setEditingUser] = useState<ReturnType<
    typeof mapUserModel
  > | null>(null);
  const [viewedUser, setViewedUser] = useState<UserModel | null>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [...UsersQueryKey.lists(), userFilter],
    queryFn: async () => {
      return accountApi.nonAdminUsers({ ...userFilter });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => accountApi.deleteUser(id),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã xoá',
        message: 'Tài khoản đã bị xoá',
        color: 'green',
      });
      await qc.invalidateQueries({ queryKey: UsersQueryKey.lists() });
      close();
      setSelectedId(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Không thể xoá tài khoản';
      notifications.show({ title: 'Lỗi', message, color: 'red' });
    },
  });

  const users = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta ?? { page: 1, limit: 10, total: 0, totalPages: 1 };

  // edit form moved into component

  const updateMutation = useMutation({
    mutationFn: async (vars: { id: string; values: Partial<EditFormValues> }) =>
      accountApi.updateUser(vars.id, vars.values),
    onSuccess: async () => {
      notifications.show({
        title: 'Đã lưu',
        message: 'Cập nhật tài khoản thành công',
        color: 'green',
      });
      await qc.invalidateQueries({ queryKey: UsersQueryKey.lists() });
      closeEdit();
      setEditingUser(null);
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : 'Không thể cập nhật tài khoản';
      notifications.show({ title: 'Lỗi', message, color: 'red' });
    },
  });

  const rows = useMemo(
    () =>
      users.map((u: UserModel) => (
        <Table.Tr key={u.id}>
          <Table.Td>
            <Group gap='sm'>
              <Avatar
                src={u.image || undefined}
                radius='xl'
                size={32}
                alt={u.name || u.email}
              >
                {(u.name?.[0] || u.email?.[0] || '?').toUpperCase()}
              </Avatar>
              <div>
                <Text fz='sm' fw={500}>
                  {u.name || '—'}
                </Text>
                <Text fz='xs' c='dimmed'>
                  {u.email}
                </Text>
              </div>
            </Group>
          </Table.Td>
          <Table.Td>
            <Badge variant='light'>{u.role}</Badge>
          </Table.Td>
          <Table.Td>
            {u.banned ? (
              <Badge color='red' variant='light'>
                Banned
              </Badge>
            ) : (
              <Badge color='green' variant='light'>
                Active
              </Badge>
            )}
          </Table.Td>
          <Table.Td>
            <Group gap='xs'>
              <Tooltip label='Xem chi tiết'>
                <ActionIcon
                  variant='subtle'
                  color='blue'
                  onClick={() => {
                    setViewedUser(u);
                    openView();
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
                    setEditingUser(mapUserModel(u));
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
                    setSelectedId(u.id);
                    open();
                  }}
                >
                  <LuTrash2 />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Table.Td>
        </Table.Tr>
      )),
    [users, open, openEdit, openView],
  );

  if (isLoading) {
    return <SkeletonCard isFullHeight lines={8} />;
  }

  return (
    <div className='p-4 flex flex-col gap-y-2'>
      <Flex justify='end'>
        <Button onClick={openCreate}>Tạo tài khoản mới</Button>
      </Flex>

      <Table striped withTableBorder withRowBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tài khoản</Table.Th>
            <Table.Th>Vai trò</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th style={{ width: 140 }}>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text c='dimmed' ta='center'>
                  Không có tài khoản nào
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Group justify='space-between' mt='md'>
        <Text size='sm' c='dimmed'>
          Tổng: {meta.total ?? users.length}
        </Text>
        <Pagination
          total={meta.totalPages ?? 1}
          value={meta.page ?? 1}
          onChange={(page) => {
            // TODO: integrate with useUsersFilter (likely via URL state)
            window.history.replaceState(null, '', `?page=${page}`);
          }}
        />
      </Group>

      <AccountDeleteModal
        opened={opened}
        loading={deleteMutation.status === 'pending'}
        onClose={close}
        onConfirm={() => selectedId && deleteMutation.mutate(selectedId)}
      />

      <AccountEditDrawer
        opened={editOpened}
        user={
          editingUser
            ? {
                id: editingUser.id,
                email: editingUser.email,
                name: editingUser.name ?? '',
                image: editingUser.image ?? '',
                role: editingUser.role,
              }
            : null
        }
        loading={updateMutation.status === 'pending'}
        onClose={() => {
          closeEdit();
          setEditingUser(null);
        }}
        onSubmit={(values) => {
          if (!editingUser?.id) return;
          updateMutation.mutate({ id: editingUser.id, values });
        }}
      />
      <Drawer
        opened={createOpened}
        onClose={closeCreate}
        title='Tạo tài khoản mới'
        position='right'
        size='md'
      >
        <CreateAccountForm
          onCreated={async () => {
            await qc.invalidateQueries({ queryKey: UsersQueryKey.lists() });
            closeCreate();
          }}
        />
      </Drawer>
      <AccountDetailsDrawer
        opened={viewOpened}
        user={viewedUser}
        onClose={() => {
          closeView();
          setViewedUser(null);
        }}
      />
    </div>
  );
}
