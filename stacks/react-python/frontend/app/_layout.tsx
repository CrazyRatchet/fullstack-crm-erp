// app/_layout.tsx

import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Provider } from 'react-redux';
import { store } from '@/src/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { colors } from '@/src/constants/theme';

// Custom Paper theme — overrides default colors with our design system
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    // Fixes the black icon background on web inputs
    onSurfaceVariant: colors.textSecondary,
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
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
          <PaperProvider theme={theme}>
            {/* headerShown: false removes the (auth) / (app) header from all screens */}
            <Stack screenOptions={{ headerShown: false }} />
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    </QueryClientProvider>
  );
}
