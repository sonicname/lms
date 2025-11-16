import { Card, Container, Group, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import ClassesFilters, {
  type FiltersState,
} from '~/modules/school-schedule/components/classes-filters';
import { ClassesList } from '~/modules/school-schedule/components/classes-list';
import Paginator from '~/modules/school-schedule/components/paginator';
import { listMyClasses } from '~/modules/school-schedule/services/classes.api';

export default function SchoolScheduleIndexPage() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || '1');
  const limit = Number(params.get('limit') || '10');
  const search = params.get('search') || '';

  const filters: FiltersState = useMemo(
    () => ({ search, limit }),
    [search, limit],
  );

  type ClassesPage = Awaited<ReturnType<typeof listMyClasses>>;
  const query = useQuery<ClassesPage>({
    queryKey: ['student', 'classes', { page, limit, search }],
    queryFn: () => listMyClasses({ page, limit, search }),
    placeholderData: (prev) => prev as ClassesPage,
  });

  const applyFilters = (next: FiltersState) => {
    const nextParams = new URLSearchParams(params);
    if (next.search) nextParams.set('search', next.search);
    else nextParams.delete('search');
    nextParams.set('limit', String(next.limit));
    nextParams.set('page', '1');
    setParams(nextParams, { replace: true });
  };

  const changePage = (p: number) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('page', String(p));
    setParams(nextParams, { replace: true });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Container size={1200} py='lg'>
        <Group justify='space-between' align='center' mb='md'>
          <Title order={3}>Lớp học của tôi</Title>
        </Group>

        <Card withBorder p='md' mb='md'>
          <ClassesFilters value={filters} onApply={applyFilters} />
        </Card>

        <ClassesList classes={query.data?.data} loading={query.isPending} />

        <Paginator
          page={query.data?.meta.page || page}
          totalPages={query.data?.meta.totalPages || 1}
          onChange={changePage}
        />
      </Container>
    </div>
  );
}
