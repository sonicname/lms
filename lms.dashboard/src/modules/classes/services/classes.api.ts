/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../../../core/api';
import type { ClassDetailModel } from '../models/class.model';
import type { CreateClassModel } from '../models/create-class.model';
import type {
  ListClassFilterModel,
  ListClassModel,
} from '../models/list-class.model';
import type { ListTagModel } from '../models/tag.model';
import type { UpdateClassModel } from '../models/update-class.model';

const basePrefix = '/classes';

export const classesApi = {
  list: (params?: ListClassFilterModel) =>
    api.get<ListClassModel>(basePrefix, { params }),
  mine: (params?: ListClassFilterModel) =>
    api.get<ListClassModel>(`${basePrefix}/mine`, { params }),
  getOne: (id: string) => api.get<ClassDetailModel>(`${basePrefix}/${id}`),
  create: (payload: CreateClassModel) =>
    api.post<any, CreateClassModel>(basePrefix, payload),
  update: (id: string, payload: UpdateClassModel) =>
    api.patch<any, UpdateClassModel>(`${basePrefix}/${id}`, payload),
  delete: (id: string) => api.delete<any>(`${basePrefix}/${id}`),
  // enrollment actions
  join: (id: string) => api.post<any>(`${basePrefix}/${id}/join`),
  approveStudent: (classId: string, studentId: string) =>
    api.post<any>(`${basePrefix}/${classId}/students/${studentId}/approve`),
  rejectStudent: (classId: string, studentId: string) =>
    api.post<any>(`${basePrefix}/${classId}/students/${studentId}/reject`),
  kickStudent: (classId: string, studentId: string) =>
    api.delete<any>(`${basePrefix}/${classId}/students/${studentId}`),
  addStudent: (classId: string, payload: { studentId: string }) =>
    api.post<any, { studentId: string }>(
      `${basePrefix}/${classId}/students`,
      payload,
    ),
  listStudents: (
    classId: string,
    params?: { page?: number; limit?: number; status?: 'pending' | 'approved' },
  ) => api.get<any>(`${basePrefix}/${classId}/students`, { params }),
  listAvailableStudents: (
    classId: string,
    params?: { page?: number; limit?: number; search?: string },
  ) => api.get<any>(`${basePrefix}/${classId}/available-students`, { params }),
  listTags: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ListTagModel>(`${basePrefix}/tags`, { params }),
};
