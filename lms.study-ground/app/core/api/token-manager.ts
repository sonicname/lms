import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface TokenState {
  accessToken?: string;
  refreshToken?: string;
}

export interface TokenStore {
  tokens: TokenState;
  setTokens: (tokens: TokenState) => void;
  clearTokens: () => void;
}

export const useTokenStore = create<TokenStore>()(
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

export const getTokenStore = useTokenStore.getState;
export const getAccessToken = () => getTokenStore().tokens.accessToken;
export const getRefreshToken = () => getTokenStore().tokens.refreshToken;
