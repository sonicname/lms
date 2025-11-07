import appEnv from 'app-env';
import Api from './api/axios';

// Shared API instance for the dashboard
const api = new Api({
  baseURL: appEnv.apiUrl,
  withCredentials: true,
});

export default api;
