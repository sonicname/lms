import appEnv from 'app-env';
import Api from './axios.ts';

// Shared API instance for the dashboard
const api = new Api({
  baseURL: appEnv.apiUrl,
  adapter: 'fetch',
});

export default api;
