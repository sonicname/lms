import { api } from '~/core/api/client';

export type QuestionModel = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export async function listQuestions(
  classId: string,
  chapterId: string,
  lessonId: string,
): Promise<QuestionModel[]> {
  return api.get(
    `/classes/${classId}/chapters/${chapterId}/lessons/${lessonId}/questions`,
  );
}

export async function createQuestion(
  classId: string,
  chapterId: string,
  lessonId: string,
  data: { title: string; content: string },
): Promise<QuestionModel> {
  return api.post(
    `/classes/${classId}/chapters/${chapterId}/lessons/${lessonId}/questions`,
    data,
  );
}
