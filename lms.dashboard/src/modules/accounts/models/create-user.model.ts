import type { UserModel } from './user.model';

export type CreateUserModel = Partial<
  Pick<UserModel, 'email' | 'name' | 'image' | 'role'>
> & {
  password?: string;
};
