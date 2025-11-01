import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export function setAuthCookies(
  res: Response,
  tokens: {
    accessToken: string;
    accessTokenExpiresIn: number; // seconds
    refreshToken: string;
    refreshTokenExpiresAt: string; // ISO date
  },
  config: ConfigService,
) {
  const isProd =
    (config.get<string>('NODE_ENV') || 'development') === 'production';
  const domain = config.get<string>('COOKIE_DOMAIN');

  // Access token cookie
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: tokens.accessTokenExpiresIn * 1000,
    path: '/',
    ...(domain ? { domain } : {}),
  });

  // Refresh token cookie
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(tokens.refreshTokenExpiresAt),
    path: '/',
    ...(domain ? { domain } : {}),
  });
}

export function clearAuthCookies(res: Response, config: ConfigService) {
  const isProd =
    (config.get<string>('NODE_ENV') || 'development') === 'production';
  const domain = config.get<string>('COOKIE_DOMAIN');
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    ...(domain ? { domain } : {}),
  } as const;

  res.clearCookie(ACCESS_TOKEN_COOKIE, base);
  res.clearCookie(REFRESH_TOKEN_COOKIE, base);
}
