import api from '../../../core/api/index.ts';

export type CreateUserDto = {
  email: string;
  password: string;
  name?: string;
  image?: string;
  role?: 'admin' | 'teacher' | 'student';
};

export type User = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: 'admin' | 'teacher' | 'student';
  createdAt: string | Date;
  updatedAt: string | Date;
};

export async function createUser(payload: CreateUserDto): Promise<User> {
  return api.post<User, CreateUserDto>('/users', payload);
}
