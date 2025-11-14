/* eslint-disable @typescript-eslint/no-explicit-any */
import { notifications } from '@mantine/notifications';
import appEnv from 'app-env';
import axios, { type AxiosResponse } from 'axios';
import { api } from '~/core/api/client';
import { getRefreshToken, getTokenStore } from '~/core/api/token-manager';
import { getAuthStore } from '~/modules/auth/stores/auth-store';

export type PublicUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  role: 'admin' | 'teacher' | 'student';
};

export type Tokens = {
  accessToken: string;
  accessTokenExpiresIn: number; // seconds
  refreshToken: string;
  refreshTokenExpiresAt: string; // ISO date
};

export type AuthResponse = {
  user: PublicUser;
  tokens: Tokens;
};

export type SignInDto = {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
};

export async function signIn(payload: SignInDto): Promise<AuthResponse> {
  const signInResponse = await axios.post<
    any,
    AxiosResponse<AuthResponse>,
    SignInDto
  >(appEnv.apiUrl + '/auth/sign-in', payload);
  // Mirror access token so Authorization header attaches for subsequent calls
  const data = signInResponse.data;

  const authStore = getAuthStore();
  if (data.user.role !== 'student') {
    notifications.show({
      title: 'Không có quyền truy cập',
      message: 'Bạn không được phép đăng nhập.',
      color: 'red',
    });

    authStore.clearAuth();
    // throw new Error('Students are not allowed to log in');
  } else {
    getTokenStore().setTokens({
      accessToken: data.tokens.accessToken,
      refreshToken: data.tokens.refreshToken,
    });
    authStore.setUser({
      createdAt: data.user.createdAt,
      updatedAt: data.user.updatedAt,
      email: data.user.email,
      id: data.user.id,
      image: data.user.image || '',
      name: data.user.name || '',
      role: data.user.role as 'admin' | 'teacher' | 'student',
    });
  }

  return data;
}

export async function refreshAuth(): Promise<AuthResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('Missing refresh token');

  const data = await api.post<AuthResponse, { refreshToken: string }>(
    '/auth/refresh-token',
    { refreshToken },
  );
  getTokenStore().setTokens({
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
  });
  return data;
}

export async function getMe(): Promise<PublicUser> {
  return api.get<PublicUser>('/users/me');
}

export async function isLoggedIn(): Promise<{
  loggedIn: boolean;
  user?: PublicUser;
}> {
  try {
    const user = await getMe();
    return { loggedIn: true, user };
  } catch {
    // If access token expired, interceptor will refresh and retry getMe automatically;
    // if it still fails, consider not logged in
    return { loggedIn: false };
  }
}

export async function logout(): Promise<void> {
  try {
    const refreshToken = getRefreshToken();
    await api.post('/auth/revoke-token', refreshToken ? { refreshToken } : {});
  } catch {
    // ignore errors
  } finally {
    getTokenStore().setTokens({
      accessToken: undefined,
      refreshToken: undefined,
    });
  }
}
