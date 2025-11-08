import {
  Avatar,
  Badge,
  Divider,
  Drawer,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import type { UserModel } from '../models/user.model';

export type AccountDetailsDrawerProps = {
  opened: boolean;
  user: UserModel | null;
  onClose: () => void;
};

export default function AccountDetailsDrawer({
  opened,
  user,
  onClose,
}: AccountDetailsDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title='Thông tin tài khoản'
      position='right'
      size='md'
    >
      {user ? (
        <Stack gap='md'>
          <Group>
            <Avatar src={user.image || undefined} size={64} radius='xl'>
              {(user.name?.[0] || user.email?.[0] || '?').toUpperCase()}
            </Avatar>
            <div>
              <Group gap='xs'>
                <Text fz='lg' fw={600}>
                  {user.name || '—'}
                </Text>
                <Badge variant='light'>{user.role}</Badge>
              </Group>
              <Text c='dimmed' size='sm'>
                {user.email}
              </Text>
            </div>
          </Group>

          <Divider label='Trạng thái' />
          <Group>
            {user.banned ? (
              <Badge color='red' variant='light'>
                Banned
              </Badge>
            ) : (
              <Badge color='green' variant='light'>
                Active
              </Badge>
            )}
            {user.banned && user.banReason ? (
              <Text size='sm'>Lý do: {user.banReason}</Text>
            ) : null}
            {user.banned && user.banExpires ? (
              <Text size='sm'>
                Hết hạn: {new Date(user.banExpires).toLocaleString()}
              </Text>
            ) : null}
          </Group>

          <Divider label='Thời gian' />
          <Stack gap={4}>
            <Text size='sm'>
              Tạo lúc: {new Date(user.createdAt).toLocaleString()}
            </Text>
            <Text size='sm'>
              Cập nhật: {new Date(user.updatedAt).toLocaleString()}
            </Text>
          </Stack>
        </Stack>
      ) : (
        <Text c='dimmed'>Không có dữ liệu</Text>
      )}
    </Drawer>
  );
}
