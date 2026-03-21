import { View, Text } from 'react-native';
import { logout } from '@/src/services/authService';
import { useAppSelector, useAppDispatch } from '@/src/store/hooks';
import { logout as logoutAction } from '@/src/store/slices/authSlice';
import { Button } from 'react-native-paper';
import { colors, radius, spacing } from '@/src/constants/theme';

export default function ProfileScreen() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutAction());
    } catch (error) {
      console.error('Logout Failed: ', error);
    }
  };
  return (
    <View className="flex-1 justify-center items-center">
      <Text>
        Hello {user?.first_name} {user?.last_name}
      </Text>
      <Button
        mode="contained"
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
