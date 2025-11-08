export const AssetsQueryKey = {
  all: ['assets'] as const,
  lists: () => [...AssetsQueryKey.all, 'list'] as const,
  list: (filter: unknown) => [...AssetsQueryKey.lists(), { filter }] as const,
  detail: (id: string) => [...AssetsQueryKey.all, 'detail', id] as const,
};
