import { notifications } from '@mantine/notifications';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface AuthStore {
  accessToken?: string;
  setAccessToken: (token?: string) => void;
  refreshToken?: string;
  setRefreshToken: (token?: string) => void;

  isLoggedIn: () => boolean;

  user?: User;
  setUser: (user?: User) => void;

  clearAuth: (showNotification?: boolean) => void;

  getCurrentUserRole: () => User['role'] | undefined;
}

export const useAuthStore = create<AuthStore>()(
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

      clearAuth: (showNotification = true) => {
        if (showNotification) {
          notifications.show({
            title: 'Logged out',
            message: 'Bạn đã đăng xuất thành công.',
            color: 'green',
          });
        }

        set({
          accessToken: undefined,
          refreshToken: undefined,
          user: undefined,
        });
      },
      getCurrentUserRole: () => {
        const user = get().user;
        return user?.role;
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const getAuthStore = () => useAuthStore.getState();
