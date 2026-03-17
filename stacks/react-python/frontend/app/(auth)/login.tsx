// app/(auth)/login.tsx

import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/store/hooks';
import { loginSuccess } from '@/src/store/slices/authSlice';
import { login } from '@/src/services/authService';
import LoginForm from '@/src/components/auth/LoginForm';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  // onSubmit will connect to the API in PASO 5
  // For now it just logs the data to verify the form works
  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      const result = await login(data);
      dispatch(loginSuccess({ user: result.user, token: result.access }));
      router.replace('/(app)');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
