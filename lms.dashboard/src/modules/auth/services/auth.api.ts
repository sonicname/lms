/* eslint-disable @typescript-eslint/no-explicit-any */
import appEnv from 'app-env';
import axios, { type AxiosResponse } from 'axios';
import api from '../../../core/api/index.ts';
import { getAuthStore } from '../stores/auth-store.ts';

export const ACCESS_TOKEN_STORAGE_KEY = 'access_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';

export type PublicUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
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

  authStore.setAccessToken(data.tokens.accessToken);
  authStore.setRefreshToken(data.tokens.refreshToken);
  authStore.setUser({
    createdAt: data.user.createdAt,
    updatedAt: data.user.updatedAt,
    email: data.user.email,
    id: data.user.id,
    image: data.user.image || '',
    name: data.user.name || '',
  });

  return data;
}

export async function refreshAuth(): Promise<AuthResponse> {
  const refreshToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
      : null;
  if (!refreshToken) throw new Error('Missing refresh token');

  const data = await api.post<AuthResponse, { refreshToken: string }>(
    '/auth/refresh-token',
    { refreshToken },
  );
  getAuthStore().setAccessToken(data.tokens.accessToken);
  getAuthStore().setRefreshToken(data.tokens.refreshToken);
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
    const refreshToken = getAuthStore().refreshToken;
    await api.post('/auth/revoke-token', refreshToken ? { refreshToken } : {});
  } catch {
    // ignore errors
  } finally {
    getAuthStore().setAccessToken(undefined);
    getAuthStore().setRefreshToken(undefined);
  }
}
