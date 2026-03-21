import { SnackbarProvider, useSnackbar } from '@/src/context/SnackbarContext';
import { store } from '@/src/store';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import { PaperProvider, Snackbar, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/src/constants/theme';
import { Provider } from 'react-redux';

// Custom Paper theme — overrides default colors with our design system
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
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
// Inner component that has access to the snackbar context
function AppContent() {
  const { visible, message, hideSnackbar } = useSnackbar();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Snackbar visible={visible} onDismiss={hideSnackbar} duration={5000}>
        {message}
      </Snackbar>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <SnackbarProvider>
              <AppContent />
            </SnackbarProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </Provider>
    </QueryClientProvider>
  );
}
