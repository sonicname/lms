import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface TokenState {
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthStore {
  tokens: TokenState;
  setTokens: (tokens: TokenState) => void;
  clearTokens: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      tokens: {
        accessToken: undefined,
        refreshToken: undefined,
      },
      clearTokens: () =>
        set({
          tokens: {
            accessToken: undefined,
            refreshToken: undefined,
          },
        }),
      setTokens: (tokens: TokenState) =>
        set((prev) => ({
          tokens: {
            ...prev.tokens,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
        })),
    }),
    {
      name: 'token-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const getAuthStore = useAuthStore.getState;
export const getAccessToken = () => getAuthStore().tokens.accessToken;
export const getRefreshToken = () => getAuthStore().tokens.refreshToken;
