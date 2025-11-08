import type { ClassModel } from './class.model';

export type ListClassFilterModel = {
  page?: number;
  limit?: number;
  search?: string;
};

export type ListClassModel = Partial<{
  data: ClassModel[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}>;
