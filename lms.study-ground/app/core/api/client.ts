import appEnv from 'app-env';
import Api from './axios';

// Central API instance. Uses env var if provided, else localhost fallback.
// Back-end Nest app likely runs on 3001 (adjust if different).
const baseURL = appEnv.apiUrl || 'http://localhost:3001';

export const api = new Api({ baseURL });

export type ApiSuccess<T> = T;

// Auth response shape inferred from back-end docs/sign-in.
export interface AuthSignInResponse {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    createdAt: string;
    updatedAt: string;
  };
  tokens: {
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshToken: string;
    refreshTokenExpiresAt: string;
  };
}

export interface SignInPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
}

export async function signIn(data: SignInPayload) {
  return api.post<AuthSignInResponse, SignInPayload>('/auth/sign-in', data);
}
