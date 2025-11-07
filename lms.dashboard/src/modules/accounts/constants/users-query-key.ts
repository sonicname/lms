const getUsersQueryKey = (...subKeys: (string | number)[]) => [
  ...['accounts'],
  ...subKeys,
];

export const UsersQueryKey = {
  lists: () => getUsersQueryKey('list'),
  details: (id: string) => getUsersQueryKey('detail', id),
};
