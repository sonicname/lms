import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from 'axios';
import {
  getAccessToken,
  getAuthStore,
  getRefreshToken,
} from '~/core/api/token-manager';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

class Api {
  instance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string | void> | null = null;
  private refreshSubscribers: Array<(token?: string) => void> = [];

  constructor(config: CreateAxiosDefaults) {
    // Don't use cookies; rely on Authorization header and refresh token body
    this.instance = axios.create({ ...config });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        // Attach Authorization header if access token is stored
        try {
          const token = getAccessToken();
          if (token) {
            config.headers = config.headers ?? {};
            (config.headers as Record<string, string>)[
              'Authorization'
            ] = `Bearer ${token}`;
          }
        } catch {
          // ignore storage errors (e.g., disabled storage)
          void 0;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        // If there's no response (network error, CORS), just bubble up
        if (!error.response) return Promise.reject(error);

        const status = error.response.status;
        const originalRequest = error.config as
          | RetriableRequestConfig
          | undefined;

        // handle 403 forbidden due to role restrictions
        if (status === 403) {
          getAuthStore().clearTokens();

          return Promise.reject(error);
        }

        // Only handle 401 once per request to avoid infinite loops
        if (status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();

            // If a token was returned and you attach Authorization, update the header for retry
            if (newToken) {
              originalRequest.headers = originalRequest.headers ?? {};
              (originalRequest.headers as Record<string, string>)[
                'Authorization'
              ] = `Bearer ${newToken}`;
            }

            // Retry the original request with updated cookies/headers
            return this.instance(originalRequest);
          } catch (refreshErr) {
            // Refresh failed – propagate so caller can redirect to sign-in
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // HTTP helpers returning response data typed via generics
  public get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.get<T>(url, config).then((r) => r.data as T);
  }

  public post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.post<T>(url, data, config).then((r) => r.data as T);
  }

  public patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.instance.patch<T>(url, data, config).then((r) => r.data as T);
  }

  public delete<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    // Allow sending a body with DELETE by merging into config
    const cfg: AxiosRequestConfig = {
      ...(config || {}),
      ...(data !== undefined ? { data } : {}),
    };
    return this.instance.delete<T>(url, cfg).then((r) => r.data as T);
  }

  private notifyRefreshed(token?: string) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  private enqueueRefresh<T>(cb: (token?: string) => T) {
    this.refreshSubscribers.push(cb);
  }

  // Performs refresh by calling the API endpoint with refreshToken from localStorage.
  // Dedupes concurrent calls. Returns the new access token string if available.
  private async refreshToken(): Promise<string | void> {
    if (this.isRefreshing && this.refreshPromise) {
      // Another refresh in-flight – wait for it and then continue
      return new Promise((resolve, reject) => {
        this.enqueueRefresh((token) => resolve(token));
        this.refreshPromise?.catch(reject);
      });
    }

    this.isRefreshing = true;

    // Read refresh token from storage
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      // No refresh token available -> cannot refresh
      this.isRefreshing = false;
      this.refreshPromise = null;
      this.notifyRefreshed(undefined);
      return Promise.reject(new Error('Missing refresh token'));
    }

    // Use a bare axios client to avoid interceptor recursion and cookie usage
    const client = axios.create({ baseURL: this.instance.defaults.baseURL });

    this.refreshPromise = client
      .post('/auth/refresh-token', { refreshToken })
      .then((res) => {
        const token: string | undefined = res?.data?.tokens?.accessToken;
        const newRefresh: string | undefined = res?.data?.tokens?.refreshToken;

        // Mirror token in localStorage if available for Authorization header usage
        getAuthStore().setTokens({
          accessToken: token,
          refreshToken: newRefresh,
        });

        this.notifyRefreshed(token);
        return token;
      })
      .catch((err) => {
        // Clear any mirrored token on failure
        getAuthStore().clearTokens();
        // Also notify waiting subscribers so they can fail-fast
        this.notifyRefreshed(undefined);
        throw err;
      })
      .finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }
}
export default Api;
