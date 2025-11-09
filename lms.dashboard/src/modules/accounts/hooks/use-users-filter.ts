import { useDebouncedValue } from '@mantine/hooks';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ListUserFilterModel } from '../models/list-user.model';

export const useUsersFilter = (debounceMs = 300) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const userFilter = useMemo<ListUserFilterModel>(() => {
    return {
      banned:
        searchParams.get('banned') === 'true'
          ? true
          : searchParams.get('banned') === 'false'
          ? false
          : undefined,
      email: searchParams.get('email') || '',
      name: searchParams.get('name') || '',
      role: searchParams.get('role') ?? undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 10,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      search:
        (searchParams.get('search') as ListUserFilterModel['search']) || '',
      sortBy:
        (searchParams.get('sortBy') as ListUserFilterModel['sortBy']) ||
        'createdAt',
      sortOrder:
        (searchParams.get('sortOrder') as ListUserFilterModel['sortOrder']) ||
        'asc',
    };
  }, [searchParams]);

  const [debouncedSearch] = useDebouncedValue(
    (userFilter.search as string) || '',
    debounceMs,
  );

  const debouncedFilter = useMemo<ListUserFilterModel>(
    () => ({ ...userFilter, search: debouncedSearch }),
    [userFilter, debouncedSearch],
  );

  const setUserFilter = (newFilter: Partial<ListUserFilterModel>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    // Reset to first page on filter change unless page is explicitly provided
    if (!('page' in newFilter)) {
      params.set('page', '1');
    }
    setSearchParams(params, { replace: true });
  };

  const setUserPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    setSearchParams(params, { replace: true });
  };

  const setUserLimit = (limit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', String(limit));
    // When changing page size, reset to first page
    params.set('page', '1');
    setSearchParams(params, { replace: true });
  };

  return {
    userFilter,
    debouncedSearch,
    debouncedFilter,
    setUserFilter,
    setUserPage,
    setUserLimit,
  };
};
