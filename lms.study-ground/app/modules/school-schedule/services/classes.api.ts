import appEnv from 'app-env';
import { api } from '~/core/api/client';

export type ClassModel = {
  id: string;
  name: string;
  description: string | null;
  code: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  teacher: {
    image: any;
    name: string;
    email: string;
  };
};

export type Paginated<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ListMyClassesParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export async function listMyClasses(params: ListMyClassesParams) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  const url = `${appEnv.apiUrl}/classes/mine${qs ? `?${qs}` : ''}`;
  return api.get<Paginated<ClassModel>>(url);
}
