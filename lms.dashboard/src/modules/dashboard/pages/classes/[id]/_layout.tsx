import { Button, Group, Tabs, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import ClassEditDrawer from '../../../../classes/components/class-edit-drawer';
import { ClassesQueryKey } from '../../../../classes/constants/classes-query-key';
import type { UpdateClassModel } from '../../../../classes/models/update-class.model';
import { classesApi } from '../../../../classes/services/classes.api';

export default function ClassDetailLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const qc = useQueryClient();

  const detailQuery = useQuery({
    enabled: !!id,
    queryKey: id ? ClassesQueryKey.detail(id) : ['classes', 'detail', 'none'],
    queryFn: async () => (id ? classesApi.getOne(id) : null),
  });

  const data = detailQuery.data;
  const memoClassData = useMemo(() => {
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      description: data.description,
    };
  }, [data]);

  const currentTab = (() => {
    const base = `/dashboard/classes/${id}`;
    if (location.pathname === base || location.pathname === `${base}/`)
      return 'details';
    if (location.pathname.startsWith(`${base}/students`)) return 'students';
    if (location.pathname.startsWith(`${base}/tests`)) return 'tests';
    if (location.pathname.startsWith(`${base}/lessons`)) return 'lessons';
    return 'details';
  })();

  return (
    <div className='p-4 flex flex-col gap-3'>
      <Group justify='space-between' align='flex-start'>
        <div>
          <Title order={3}>{data?.name ?? '...'}</Title>
          <Text c='dimmed' size='sm'>
            {data?.description || 'Không có mô tả'}
          </Text>
          {data?.teacher && (
            <Text size='sm' mt={4}>
              Giáo viên: <b>{data.teacher.name || data.teacher.email}</b>
            </Text>
          )}
        </div>
        <Button variant='light' onClick={openEdit} disabled={!data}>
          Chỉnh sửa lớp học
        </Button>
      </Group>

      <Tabs
        value={currentTab}
        onChange={(v) => {
          const base = `/dashboard/classes/${id}`;
          if (v === 'details') navigate(base);
          if (v === 'students') navigate(`${base}/students`);
          if (v === 'tests') navigate(`${base}/tests`);
          if (v === 'lessons') navigate(`${base}/lessons`);
        }}
      >
        <Tabs.List>
          <Tabs.Tab value='details'>Chi tiết</Tabs.Tab>
          <Tabs.Tab value='students'>Học sinh</Tabs.Tab>
          <Tabs.Tab value='tests'>Bài kiểm tra</Tabs.Tab>
          <Tabs.Tab value='lessons'>Bài học</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <div>
        <Outlet />
      </div>

      <ClassEditDrawer
        opened={editOpened}
        classData={memoClassData}
        loading={false}
        onClose={closeEdit}
        onSubmit={async (values: UpdateClassModel) => {
          if (!id) return;
          await classesApi.update(id, values);
          await qc.invalidateQueries({ queryKey: ClassesQueryKey.detail(id) });
          closeEdit();
        }}
      />
    </div>
  );
}
