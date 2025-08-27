import axios from 'axios';
import { emitError } from '../../services/errorBus';

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
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

export default client;
