// app/(auth)/login.tsx

import RegisterForm from '@/src/components/auth/RegisterForm';
import { useRouter } from 'expo-router';
import { register } from '@/src/services/authService';
export default function RegisterScreen() {
  // onSubmit  connect to the API
  const router = useRouter();

  const handleRegister = async (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirm: string;
    company_name: string;
    company_slug: string;
  }) => {
    try {
      await register(data);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Register Failed: ', error);
    }
  };

  return <RegisterForm onSubmit={handleRegister} />;
}
