export const QaQueryKey = {
  all: ['qa'] as const,
  questions: (classId: string, chapterId: string, lessonId: string) =>
    [...QaQueryKey.all, 'questions', classId, chapterId, lessonId] as const,
  question: (
    classId: string,
    chapterId: string,
    lessonId: string,
    questionId: string,
  ) =>
    [
      ...QaQueryKey.all,
      'question',
      classId,
      chapterId,
      lessonId,
      questionId,
    ] as const,
  answers: (
    classId: string,
    chapterId: string,
    lessonId: string,
    questionId: string,
  ) =>
    [
      ...QaQueryKey.all,
      'answers',
      classId,
      chapterId,
      lessonId,
      questionId,
    ] as const,
};
