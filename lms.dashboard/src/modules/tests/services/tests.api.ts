/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../../../core/api';
import type {
  CreateTestModel,
  TestModel,
  UpdateTestModel,
} from '../models/test.model';

export const testsApi = {
  list: (classId: string) => api.get<TestModel[]>(`/classes/${classId}/tests`),
  getOne: (classId: string, testId: string) =>
    api.get<TestModel>(`/classes/${classId}/tests/${testId}`),
  create: (classId: string, payload: CreateTestModel) =>
    api.post<any, CreateTestModel>(`/classes/${classId}/tests`, payload),
  update: (classId: string, testId: string, payload: UpdateTestModel) =>
    api.patch<any, UpdateTestModel>(
      `/classes/${classId}/tests/${testId}`,
      payload,
    ),
  delete: (classId: string, testId: string) =>
    api.delete<any>(`/classes/${classId}/tests/${testId}`),
  attachAssets: (classId: string, testId: string, assetIds: string[]) =>
    api.post<any, { assetIds: string[] }>(
      `/classes/${classId}/tests/${testId}/assets`,
      { assetIds },
    ),
  // MCQ: import quizzes by tags
  importByTags: (
    classId: string,
    testId: string,
    payload: {
      tagIds?: string[];
      tagNames?: string[];
      points?: number | null;
      startOrder?: number | null;
    },
  ) =>
    api.post<any, typeof payload>(
      `/classes/${classId}/tests/${testId}/import-quizzes`,
      payload,
    ),
  // Essay: questions CRUD
  listEssayQuestions: (classId: string, testId: string) =>
    api.get<Array<{ id: string; prompt: string | null; displayOrder: number }>>(
      `/classes/${classId}/tests/${testId}/essay-questions`,
    ),
  createEssayQuestion: (
    classId: string,
    testId: string,
    payload: { prompt?: string | null; displayOrder?: number | null },
  ) =>
    api.post<any, typeof payload>(
      `/classes/${classId}/tests/${testId}/essay-questions`,
      payload,
    ),
  updateEssayQuestion: (
    classId: string,
    testId: string,
    questionId: string,
    payload: { prompt?: string | null; displayOrder?: number | null },
  ) =>
    api.patch<any, typeof payload>(
      `/classes/${classId}/tests/${testId}/essay-questions/${questionId}`,
      payload,
    ),
  attachEssayQuestionAssets: (
    classId: string,
    testId: string,
    questionId: string,
    assetIds: string[],
  ) =>
    api.post<any, { assetIds: string[] }>(
      `/classes/${classId}/tests/${testId}/essay-questions/${questionId}/assets`,
      { assetIds },
    ),
  deleteEssayQuestion: (classId: string, testId: string, questionId: string) =>
    api.post(
      `/classes/${classId}/tests/${testId}/essay-questions/${questionId}/delete`,
    ),
};
