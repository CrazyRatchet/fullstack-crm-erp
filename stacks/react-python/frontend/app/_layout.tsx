import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { store } from '@/src/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider>
          <Stack />
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
