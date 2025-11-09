import api from '../../../core/api';

export type ChapterModel = {
  id: string;
  title: string;
  content: string | null;
  displayOrder: number;
  classId: string;
  createdAt: string;
  updatedAt: string;
};

export type LessonModel = {
  id: string;
  title: string;
  content: string | null;
  displayOrder: number;
  scheduleDate: string | null;
  chapterId: string;
  createdAt: string;
  updatedAt: string;
};

export const curriculumApi = {
  listChapters: (classId: string) =>
    api.get<ChapterModel[]>(`/classes/${classId}/chapters`),
  listLessons: (classId: string, chapterId: string) =>
    api.get<LessonModel[]>(`/classes/${classId}/chapters/${chapterId}/lessons`),
};
