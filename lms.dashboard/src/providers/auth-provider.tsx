export type AuthContextType = {
  accessToken?: string;
  refreshToken?: string;
  isLoggedIn: boolean;

  setAccessToken: (token?: string) => void;
  setRefreshToken: (token?: string) => void;
  logout: () => void;
  login?: <T>(payload: T) => Promise<void>;
  refreshTokens?: (refreshToken?: string) => Promise<void>;
};
