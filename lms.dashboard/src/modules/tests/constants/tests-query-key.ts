export const TestsQueryKey = {
  all: ['tests'] as const,
  list: (classId: string) => [...TestsQueryKey.all, 'list', classId] as const,
  detail: (classId: string, testId: string) =>
    [...TestsQueryKey.all, 'detail', classId, testId] as const,
};
