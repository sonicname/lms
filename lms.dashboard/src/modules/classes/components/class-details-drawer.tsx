import {
  Avatar,
  Badge,
  Drawer,
  Group,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import type { ClassDetailModel } from '../models/class.model';

export type ClassDetailsDrawerProps = {
  opened: boolean;
  data: ClassDetailModel | null;
  onClose: () => void;
};

export default function ClassDetailsDrawer({
  opened,
  data,
  onClose,
}: ClassDetailsDrawerProps) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title='Thông tin lớp học'
      position='right'
      size='lg'
    >
      {data ? (
        <Stack gap='md'>
          <div>
            <Text fw={600} fz='lg'>
              {data.name}
            </Text>
            <Text c='dimmed' size='sm'>
              Mã: {data.code}
            </Text>
            <Text size='sm'>Mô tả: {data.description || '—'}</Text>
            <Text size='sm'>
              Giáo viên: {data.teacher?.name || data.teacher?.email}
            </Text>
            <Text size='sm'>
              Tạo lúc: {new Date(data.createdAt).toLocaleString()}
            </Text>
          </div>

          <Text fw={600}>Học viên</Text>
          <Table striped withTableBorder withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Học viên</Table.Th>
                <Table.Th>Trạng thái</Table.Th>
                <Table.Th>Thời gian</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.students.length ? (
                data.students.map((s) => (
                  <Table.Tr key={s.studentId}>
                    <Table.Td>
                      <Group gap='sm'>
                        <Avatar radius='xl' size={28}>
                          {(
                            s.student.name?.[0] ||
                            s.student.email[0] ||
                            '?'
                          ).toUpperCase()}
                        </Avatar>
                        <div>
                          <Text fz='sm' fw={500}>
                            {s.student.name || '—'}
                          </Text>
                          <Text fz='xs' c='dimmed'>
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
                      <Text size='sm'>
                        {s.approvedAt
                          ? new Date(s.approvedAt).toLocaleString()
                          : '—'}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text c='dimmed' ta='center'>
                      Chưa có học viên
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Stack>
      ) : (
        <Text c='dimmed'>Không có dữ liệu</Text>
      )}
    </Drawer>
  );
}
