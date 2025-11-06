import { useEffect, type ReactNode } from 'react';
import { createAuthStore } from '../stores/auth-store';

export interface AppProviderProps<LoginPayload> {
  verifyToken: (token: string) => Promise<boolean>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: (refreshToken: string) => Promise<void>;
  children: ReactNode;
}

export function AppProvider<LoginPayload>({
  children,
  ...props
}: AppProviderProps<LoginPayload>) {
  useEffect(() => {
    console.log('AppProvider mounted');

    createAuthStore({
      verifyToken: props.verifyToken,
      login: props.login,
      logout: props.logout,
      refreshTokens: props.refreshTokens,
    });
  }, [props.login, props.logout, props.refreshTokens, props.verifyToken]);

  return <>{children}</>;
}
