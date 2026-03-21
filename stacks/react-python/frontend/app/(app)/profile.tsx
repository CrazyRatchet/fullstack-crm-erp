import { View, Text } from 'react-native';
import { logout } from '@/src/services/authService';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { logout as logoutAction } from '@/src/store/slices/authSlice';
import { Button } from 'react-native-paper';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useSnackbar } from '@/src/context/SnackbarContext';
import { useState } from 'react';

export default function ProfileScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { showSnackbar } = useSnackbar();
  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      dispatch(logoutAction());
    } catch (error) {
      showSnackbar('Log out Failed. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View className="flex-1 justify-center items-center">
      <Text>
        Hello {user?.first_name} {user?.last_name}
      </Text>
      <Button
        mode="contained"
        loading={isLoading}
        disabled={isLoading}
        onPress={handleLogout}
        buttonColor={colors.error}
        style={{ marginTop: spacing.sm, borderRadius: radius.sm }}
        contentStyle={{ paddingVertical: 6 }}
      >
        Log out
      </Button>
    </View>
  );
}
