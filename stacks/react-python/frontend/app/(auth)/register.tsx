// app/(auth)/login.tsx

import RegisterForm from '@/src/components/auth/RegisterForm';

export default function RegisterScreen() {
  // onSubmit will connect to the API

  const handleRegister = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    companyName: string;
    companySlug: string;
  }) => {
    console.log('Register data:', data);
  };

  return <RegisterForm onSubmit={handleRegister} />;
}
