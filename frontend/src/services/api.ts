import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'http://127.0.0.1:8000/api/v1';

export const TOKEN_STORAGE_KEY = 'cloudvault_token';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global 401 handling — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      // Don't clear auth if the 401 came from the public share endpoint
      if (!requestUrl.includes('/share/')) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        // Avoid redirect loop if already on a public route
        if (
          !window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register') &&
          !window.location.pathname.startsWith('/share/')
        ) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
