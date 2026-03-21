// app/(auth)/login.tsx

import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/store/hooks';
import { loginSuccess } from '@/src/store/slices/authSlice';
import { login } from '@/src/services/authService';
import LoginForm from '@/src/components/auth/LoginForm';
import { useSnackbar } from '@/src/context/SnackbarContext';

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useSnackbar();

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      const result = await login(data);
      dispatch(loginSuccess({ user: result.user, token: result.access }));
      router.replace('/(app)');
    } catch (error) {
      showSnackbar('Invalid email or password. Please try again.');
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
