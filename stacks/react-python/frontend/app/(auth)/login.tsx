// app/(auth)/login.tsx

import LoginForm from '@/src/components/auth/LoginForm';

export default function LoginScreen() {
  // onSubmit will connect to the API in PASO 5
  // For now it just logs the data to verify the form works
  const handleLogin = async (data: { email: string; password: string }) => {
    console.log('Login data:', data);
  };

  return <LoginForm onSubmit={handleLogin} />;
}
