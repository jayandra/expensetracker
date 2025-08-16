import axios from 'axios';
import { emitError } from './errorBus';

// Central Axios configuration
const API_URL = import.meta.env.VITE_API_URL;

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Optional: set a reasonable timeout
// axios.defaults.timeout = 20000;

// Response error handling interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message =
      data?.message ||
      data?.error ||
      error?.message ||
      'An unexpected error occurred';

    // Normalize the error shape while keeping original error
    const normalized = { ...error, status, data, message };
    // Publish to the global error bus for UI to pick up
    try { emitError(normalized); } catch { /* no-op */ }
    return Promise.reject(normalized);
  }
);

export default axios;
