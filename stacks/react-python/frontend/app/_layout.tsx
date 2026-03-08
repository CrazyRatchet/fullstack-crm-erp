import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { store } from '@/src/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Re-fetch data when window regains focus
      refetchOnWindowFocus: false,
      // Retry failed requests once
      retry: 1,
      // Data is considered fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <SafeAreaProvider>
          <PaperProvider>
            <Stack />
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    </QueryClientProvider>
  );
}
