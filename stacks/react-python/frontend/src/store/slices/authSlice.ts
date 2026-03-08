import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Shape of the authenticated user
interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

// Shape of the auth state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called when login starts
    loginStart: (state) => {
      state.isLoading = true;
    },
    // Called when login succeeds
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    // Called when login fails or user logs out
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const { loginStart, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
