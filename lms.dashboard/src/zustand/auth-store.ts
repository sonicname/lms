import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  // auth tokens
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  refreshToken: string | null;
  setRefreshToken: (token: string | null) => void;
  login?: <T>(payload: T) => Promise<void>;
  refreshTokens?: (refreshToken?: string) => Promise<void>;

  // user info could be added here
  isLoggedIn: boolean;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (token) => set({ accessToken: token }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, isLoggedIn: false }),
      refreshToken: null,
      setRefreshToken: (token) => set({ refreshToken: token }),

      isLoggedIn: false,
    }),
    {
      name: 'auth-tokens',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const getAuthStore = () => authStore.getState();
