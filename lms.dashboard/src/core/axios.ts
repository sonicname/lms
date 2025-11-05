import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type CreateAxiosDefaults,
  type InternalAxiosRequestConfig,
} from 'axios';

// Optional localStorage key if you also want to mirror access token in JS-land
const ACCESS_TOKEN_STORAGE_KEY = 'access_token';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

class Api {
  instance: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string | void> | null = null;
  private refreshSubscribers: Array<(token?: string) => void> = [];

  constructor(config: CreateAxiosDefaults) {
    this.instance = axios.create({ withCredentials: true, ...config });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.instance.interceptors.request.use(
      (config) => {
        // Always send cookies for session-based auth
        config.withCredentials = config.withCredentials ?? true;

        // If you prefer also sending Authorization header (when stored), attach it
        try {
          const token =
            typeof window !== 'undefined'
              ? window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
              : null;
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

  // Performs refresh by calling the API endpoint, deduping concurrent calls.
  // Returns the new access token if the API returns one, or void if cookies-only auth.
  private async refreshToken(): Promise<string | void> {
    if (this.isRefreshing && this.refreshPromise) {
      // Another refresh in-flight – wait for it and then continue
      return new Promise((resolve, reject) => {
        this.enqueueRefresh((token) => resolve(token));
        this.refreshPromise?.catch(reject);
      });
    }

    this.isRefreshing = true;

    // Use a bare axios client to avoid interceptor recursion
    const client = axios.create({
      baseURL: this.instance.defaults.baseURL,
      withCredentials: true,
    });

    this.refreshPromise = client
      .post('/auth/refresh-token', {})
      .then((res) => {
        const token: string | undefined = res?.data?.tokens?.accessToken;

        // Mirror token in localStorage if available for Authorization header usage
        if (token && typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
          } catch {
            // ignore storage issues
            void 0;
          }
        }

        this.notifyRefreshed(token);
        return token;
      })
      .catch((err) => {
        // Clear any mirrored token on failure
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          } catch {
            void 0;
          }
        }
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
