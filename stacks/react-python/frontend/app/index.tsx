// app/index.tsx

import { Redirect } from 'expo-router';
import { useAppSelector } from '@/src/store/hooks';
import '../global.css';

export default function Index() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return isAuthenticated ? <Redirect href="/(app)" /> : <Redirect href="/(auth)/login" />;
}
