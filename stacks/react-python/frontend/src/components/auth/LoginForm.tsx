// src/components/auth/LoginForm.tsx

import { useState } from 'react';
import {
  View,
  Text,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { colors, spacing, radius } from '@/src/constants/theme';

// --- VALIDATION SCHEMA ---
// Defines the rules for each field in the form
// zod will automatically show these messages when validation fails
const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// --- TYPE ---
// TypeScript type inferred from the schema — no need to define it twice
type LoginFormData = z.infer<typeof loginSchema>;

// --- PROPS ---
// What the parent screen must pass to this component
interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  // Controls whether the password is visible or hidden
  const [showPassword, setShowPassword] = useState(false);

  // Gets the current screen width to switch between mobile and web layouts
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  // useForm manages all field state, validation and submission
  // zodResolver connects our zod schema to react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <KeyboardAvoidingView
      // On iOS, 'padding' pushes the form up when keyboard appears
      // On Android/web, 'height' shrinks the container instead
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        // Allows tapping outside inputs to dismiss keyboard
        keyboardShouldPersistTaps="handled"
      >
        {/* Outer container — centers content on web, fullscreen on mobile */}
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
            padding: spacing.md,
          }}
        >
          {/* Card — fixed width on web, full width on mobile */}
          <View
            style={{
              width: isWeb ? 420 : '100%',
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              padding: isWeb ? spacing.xl : spacing.lg,
              // Shadow only renders on web/iOS — elevation is for Android
              ...(isWeb && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 4,
              }),
            }}
          >
            {/* Brand */}
            <View style={{ marginBottom: spacing.xl }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.primary,
                }}
              >
                Business Hub
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                CRM & ERP Platform
              </Text>
            </View>

            {/* Title */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: colors.textPrimary,
                }}
              >
                Welcome back
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                Sign in to your account
              </Text>
            </View>

            {/* Form fields */}
            <View style={{ gap: spacing.sm }}>
              {/* Email field */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: errors.email ? colors.error : colors.textSecondary,
                        marginBottom: 4,
                        fontWeight: '500',
                      }}
                    >
                      Email
                    </Text>
                    <TextInput
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={!!errors.email}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      // Hide the floating label since we use our own above
                      label=""
                      style={{ backgroundColor: colors.surface }}
                    />
                  </View>
                )}
              />
              {errors.email && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
                  {errors.email.message}
                </Text>
              )}

              {/* Password field */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: errors.password ? colors.error : colors.textSecondary,
                        marginBottom: 4,
                        fontWeight: '500',
                      }}
                    >
                      Password
                    </Text>
                    <TextInput
                      mode="outlined"
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={!!errors.password}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      label=""
                      style={{ backgroundColor: colors.surface }}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? 'eye-off' : 'eye'}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                    />
                  </View>
                )}
              />
              {errors.password && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
                  {errors.password.message}
                </Text>
              )}

              {/* Submit button */}
              <Button
                mode="contained"
                // handleSubmit runs validation first, then calls onSubmit if valid
                onPress={handleSubmit(onSubmit)}
                loading={isLoading || isSubmitting}
                disabled={isLoading || isSubmitting}
                buttonColor={colors.primary}
                style={{ marginTop: spacing.md, borderRadius: radius.sm }}
                contentStyle={{ paddingVertical: 6 }}
              >
                Sign in
              </Button>

              {/* Link to register screen */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: spacing.md,
                }}
              >
                <Text style={{ color: colors.textSecondary }}>{"Don't have an account? "}</Text>
                <Link href="/(auth)/register">
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign up</Text>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
