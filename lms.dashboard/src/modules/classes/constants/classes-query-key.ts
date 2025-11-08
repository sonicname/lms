export const ClassesQueryKey = {
  all: ['classes'] as const,
  lists: () => [...ClassesQueryKey.all, 'list'] as const,
  list: (filter: unknown) => [...ClassesQueryKey.lists(), { filter }] as const,
  detail: (id: string) => [...ClassesQueryKey.all, 'detail', id] as const,
  students: (id: string, filter: unknown) =>
    [...ClassesQueryKey.detail(id), 'students', { filter }] as const,
};
