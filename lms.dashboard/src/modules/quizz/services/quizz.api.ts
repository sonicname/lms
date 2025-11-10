import api from '../../../core/api';
import type {
  ChoiceModel,
  CreateChoiceModel,
  CreateQuizModel,
  Paged,
  QuizModel,
  QuizTagModel,
  UpdateChoiceModel,
  UpdateQuizModel,
} from '../models/quizz.model';

export const quizzApi = {
  listMine: (page = 1, limit = 10) =>
    api.get<Paged<QuizModel>>(`/quizzes/me`, { params: { page, limit } }),
  getMine: (id: string) => api.get<QuizModel>(`/quizzes/me/${id}`),
  createMine: (payload: CreateQuizModel) =>
    api.post<QuizModel, CreateQuizModel>(`/quizzes/me`, payload),
  updateMine: (id: string, payload: UpdateQuizModel) =>
    api.patch<QuizModel, UpdateQuizModel>(`/quizzes/me/${id}`, payload),
  deleteMine: (id: string) => api.delete(`/quizzes/me/${id}`),

  listChoices: (quizId: string) =>
    api.get<ChoiceModel[]>(`/quizzes/me/${quizId}/choices`),
  createChoice: (quizId: string, payload: CreateChoiceModel) =>
    api.post<ChoiceModel, CreateChoiceModel>(
      `/quizzes/me/${quizId}/choices`,
      payload,
    ),
  updateChoice: (
    quizId: string,
    choiceId: string,
    payload: UpdateChoiceModel,
  ) =>
    api.patch<ChoiceModel, UpdateChoiceModel>(
      `/quizzes/me/${quizId}/choices/${choiceId}`,
      payload,
    ),
  deleteChoice: (quizId: string, choiceId: string) =>
    api.delete(`/quizzes/me/${quizId}/choices/${choiceId}`),

  // Tags: assume backend exposes endpoints under /quizzes/me/:quizId/tags
  listTags: (quizId: string) =>
    api.get<QuizTagModel[]>(`/quizzes/me/${quizId}/tags`),
  attachTagsByNames: (quizId: string, names: string[]) =>
    api.post<{ success: true }, { names: string[] }>(
      `/quizzes/me/${quizId}/tags`,
      { names },
    ),
  detachTag: (quizId: string, tagId: string) =>
    api.delete(`/quizzes/me/${quizId}/tags/${tagId}`),
};
