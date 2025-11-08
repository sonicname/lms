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
  attachAssets: (classId: string, testId: string, assetIds: string[]) =>
    api.post<any, { assetIds: string[] }>(
      `/classes/${classId}/tests/${testId}/assets`,
      { assetIds },
    ),
};
