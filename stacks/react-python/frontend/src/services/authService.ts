// src/services/authService.ts
import api from '@/src/api/axios';
import {
  saveToken,
  saveRefreshToken,
  clearTokens,
  getRefreshToken,
} from '@/src/services/tokenService';

// -- TYPES --
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone: string;
  company_name: string;
  company_slug: string;
}

interface AuthUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role?: string;
  tenantId?: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

interface RegisterResponse {
  message: string;
  user: AuthUser;
}

// -- FUNCTIONS --
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post('/v1/auth/login/', credentials);
  await saveToken(response.data.access);
  await saveRefreshToken(response.data.refresh);
  return response.data;
};

export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await api.post('/v1/auth/register/', data);
  return response.data;
};

export const logout = async (): Promise<void> => {
  const refreshToken = await getRefreshToken();
  await api.post('/v1/auth/logout/', { refresh: refreshToken });
  await clearTokens();
};
