import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AuthStoreState<LoginPayload, UserData, RolesEnum> = {
  // data can be extended with additional fields
  [key: string]: unknown;
  accessToken?: string;
  refreshToken?: string;
  user?: UserData;
  roles?: RolesEnum[];

  // actions
  setTokens?: (accessToken: string, refreshToken: string) => void;
  setUser?: (user: UserData) => void;
  setRoles?: (roles: RolesEnum[]) => void;
  clearAll?: () => void;

  // handlers
  isAuthenticated?: () => boolean;
  verifyToken?: (token: string) => Promise<boolean>;
  login?: (payload: LoginPayload) => Promise<void>;
  logout?: () => Promise<void>;
  refreshTokens?: (refreshToken: string) => Promise<void>;
};

export const createAuthStore = <LoginPayload, UserData, RolesEnum>(
  data: AuthStoreState<LoginPayload, UserData, RolesEnum>,
) => {
  return create<AuthStoreState<LoginPayload, UserData, RolesEnum>>()(
    persist(
      (set, get) => ({
        ...data,
        clearAll() {
          set({
            accessToken: undefined,
            refreshTokens: undefined,
            user: undefined,
            roles: undefined,
          });
        },
        isAuthenticated() {
          const token = get().accessToken;
          const user = get().user;
          return !!token && !!user;
        },
        setTokens(accessToken: string, refreshToken: string) {
          set({ accessToken, refreshToken });
        },
        setUser(user: UserData) {
          set({ user });
        },
        setRoles(roles: RolesEnum[]) {
          set({ roles });
        },
      }),
      {
        name: 'auth-storage', // name of the storage (must be unique)
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          user: state.user,
          roles: state.roles,
        }),
      },
    ),
  );
};
