import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ListUserFilterModel } from '../models/list-user.model';

export const useUsersFilter = () => {
  const [searchParams] = useSearchParams();

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

  const setUserFilter = (newFilter: Partial<ListUserFilterModel>) => {
    Object.entries(newFilter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      } else {
        searchParams.delete(key);
      }
    });

    searchParams.set('page', '1'); // Reset to first page on filter change

    return searchParams;
  };

  return { userFilter, setUserFilter };
};
