import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthStore {
  accessToken?: string;
  setAccessToken: (token?: string) => void;
  refreshToken?: string;
  setRefreshToken: (token?: string) => void;

  isLoggedIn: () => boolean;

  user?: User;
  setUser: (user?: User) => void;
}

export const authStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: undefined,
      setAccessToken: (token?: string) => set({ accessToken: token }),
      refreshToken: undefined,
      setRefreshToken: (token?: string) => set({ refreshToken: token }),
      isLoggedIn: () => {
        const token = get().accessToken;
        return !!token;
      },
      user: undefined,
      setUser: (user?: User) => set({ user }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const getAuthStore = () => authStore.getState();
