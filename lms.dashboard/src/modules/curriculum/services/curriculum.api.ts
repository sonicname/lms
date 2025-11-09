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
  createChapter: (
    classId: string,
    payload: { title: string; content?: string | null; displayOrder?: number },
  ) =>
    api.post<unknown, typeof payload>(`/classes/${classId}/chapters`, payload),
  updateChapter: (
    classId: string,
    chapterId: string,
    payload: {
      title?: string;
      content?: string | null;
      displayOrder?: number;
    },
  ) =>
    api.patch<unknown, typeof payload>(
      `/classes/${classId}/chapters/${chapterId}`,
      payload,
    ),
  deleteChapter: (classId: string, chapterId: string) =>
    api.delete<unknown>(`/classes/${classId}/chapters/${chapterId}`),
  createLesson: (
    classId: string,
    chapterId: string,
    payload: {
      title: string;
      content?: string | null;
      displayOrder?: number;
      scheduleDate?: string | null;
    },
  ) =>
    api.post<unknown, typeof payload>(
      `/classes/${classId}/chapters/${chapterId}/lessons`,
      payload,
    ),
  updateLesson: (
    classId: string,
    chapterId: string,
    lessonId: string,
    payload: {
      title?: string;
      content?: string | null;
      displayOrder?: number;
      scheduleDate?: string | null;
    },
  ) =>
    api.patch<unknown, typeof payload>(
      `/classes/${classId}/chapters/${chapterId}/lessons/${lessonId}`,
      payload,
    ),
  attachAssetsToLesson: (
    classId: string,
    chapterId: string,
    lessonId: string,
    assetIds: string[],
  ) =>
    api.post<unknown, { assetIds: string[] }>(
      `/classes/${classId}/chapters/${chapterId}/lessons/${lessonId}/assets`,
      { assetIds },
    ),
};
