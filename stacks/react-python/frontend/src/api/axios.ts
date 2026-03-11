// src/api/axios.ts

import axios from 'axios';
import { getToken } from '@/src/services/tokenService';

// Base URL of the backend API
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8001';

// Create a custom Axios instance with default configuration
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - runs before every request is sent
api.interceptors.request.use(
  async (config) => {
    // Get token from secure storage and attached to request
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - runs after every response is received
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
