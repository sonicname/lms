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
  user?: User;
  setUser: (user?: User) => void;

  isLoggedIn: () => boolean;
  clearAuth: (callback?: (user?: User) => void) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: undefined,
      setUser: (user?: User) => set({ user }),
      isLoggedIn: () => {
        const user = get().user;
        return !!user;
      },
      clearAuth: (callback?: (user?: User) => void) => {
        const user = get().user;
        set({ user: undefined });
        if (callback) {
          callback(user);
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
