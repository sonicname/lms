import { api } from '~/core/api/client';

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

export async function listChapters(classId: string): Promise<ChapterModel[]> {
  return api.get(`/classes/${classId}/chapters`);
}

export async function listLessons(
  classId: string,
  chapterId: string,
): Promise<LessonModel[]> {
  return api.get(`/classes/${classId}/chapters/${chapterId}/lessons`);
}
