// src/api/axios.ts

import axios from 'axios';
import { getToken, getRefreshToken, saveToken, clearTokens } from '@/src/services/tokenService';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8001';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tracks whether a token refresh is already in progress
// This prevents multiple simultaneous refresh requests
// if several requests fail with 401 at the same time
let isRefreshing = false;

// Queue of requests that failed while a refresh was in progress
// They will be retried once the new token is available
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

// Resolves or rejects all queued requests after a refresh attempt
const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor — attaches the access token to every outgoing request
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handles expired tokens automatically
api.interceptors.response.use(
  // Successful response — pass it through unchanged
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh if:
    // 1. The error is 401 (unauthorized)
    // 2. We haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // A refresh is already in progress — queue this request
        // and wait for the new token before retrying
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark this request so we don't retry it again if it fails
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          // No refresh token available — user must log in again
          await clearTokens();
          processQueue(new Error('No refresh token'), null);
          return Promise.reject(error);
        }

        // Request a new access token from the backend
        // We use axios directly (not our api instance) to avoid
        // triggering this interceptor again in an infinite loop
        const response = await axios.post(`${BASE_URL}/api/v1/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;

        // Save the new token and retry all queued requests
        await saveToken(newAccessToken);
        processQueue(null, newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear tokens and force re-login
        await clearTokens();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
