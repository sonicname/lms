import type { UserModel } from './user.model';

export type ListUserFilterModel = {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  sortBy?: 'createdAt' | 'name' | 'email' | 'updatedAt' | 'role';
  sortOrder?: 'asc' | 'desc';
};

export type ListUserModel = Partial<{
  data: UserModel[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>;
