import api from '../../../core/api';

export type LessonItem = {
  id: string;
  title: string;
};

export const lessonsApi = {
  async list(classId: string, chapterId: string): Promise<LessonItem[]> {
    return api.get<LessonItem[]>(
      `/classes/${classId}/chapters/${chapterId}/lessons`,
    );
  },
};
