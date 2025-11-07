/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../../../core/api';
import type { BanUserModel } from '../models/ban-user.model';
import type { CreateUserModel } from '../models/create-user.model';
import type {
  ListUserFilterModel,
  ListUserModel,
} from '../models/list-user.model';
import type { UserModel } from '../models/user.model';

const basePrefix = '/users';

export const accountApi = {
  getCurrentAccount: () => {
    return api.get<UserModel>(`${basePrefix}/me`);
  },
  createUser: (payload: CreateUserModel) => {
    return api.post<any, CreateUserModel>(`${basePrefix}`, payload);
  },
  listUsers: (searchQuery?: ListUserFilterModel) => {
    return api.get<ListUserModel>(`${basePrefix}`, { params: searchQuery });
  },
  nonAdminUsers: (searchQuery?: ListUserFilterModel) => {
    return api.get<ListUserModel>(`${basePrefix}/non-admins`, {
      params: searchQuery,
    });
  },
  updateUser: (id: string, payload: Partial<CreateUserModel>) => {
    return api.patch<any, Partial<CreateUserModel>>(
      `${basePrefix}/${id}`,
      payload,
    );
  },
  deleteUser: (id: string) => {
    return api.delete<any>(`${basePrefix}/${id}`);
  },
  banUser: (id: string, payload: BanUserModel) => {
    return api.post<any, BanUserModel>(`${basePrefix}/${id}/ban`, payload);
  },
  unbanUser: (id: string) => {
    return api.post<any>(`${basePrefix}/${id}/unban`);
  },
};
