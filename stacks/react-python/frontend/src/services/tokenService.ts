//src/service/tokenService.ts

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// SecureStore works on IOS/Android only
// On web we fall back to localStorage
const save = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const get = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
};

const remove = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// Save access token to secure storage
export const saveToken = async (token: string): Promise<void> => {
  await save(TOKEN_KEY, token);
};

// Get access token from secure storage
export const getToken = async (): Promise<string | null> => {
  return await get(TOKEN_KEY);
};

// Save refresh token to secure storage
export const saveRefreshToken = async (token: string): Promise<void> => {
  await save(REFRESH_TOKEN_KEY, token);
};

// Get refresh token from secure storage
export const getRefreshToken = async (): Promise<string | null> => {
  return await get(REFRESH_TOKEN_KEY);
};

// Remove all tokens (used on logout)
export const clearTokens = async (): Promise<void> => {
  await remove(TOKEN_KEY);
  await remove(REFRESH_TOKEN_KEY);
};
