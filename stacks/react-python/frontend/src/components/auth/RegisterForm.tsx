// src/components/auth/RegisterForm.tsx

import { useState } from 'react';
import {
  View,
  Text,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, Button } from 'react-native-paper';
import { Link } from 'expo-router';
import { colors, spacing, radius } from '@/src/constants/theme';

// --- VALIDATION SCHEMA ---
const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    companyName: z.string().min(2, 'Company name must be at least 2 characters'),
    companySlug: z
      .string()
      .min(2, 'Company slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and hyphens'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// --- TYPE ---
type RegisterFormData = z.infer<typeof registerSchema>;

// --- PROPS ---
interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Responsive layout — card on web, fullscreen on mobile
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      companySlug: '',
    },
  });

  // Validates step 1 fields before allowing navigation to step 2
  const goToNextStep = async () => {
    const isValid = await trigger([
      'firstName',
      'lastName',
      'email',
      'password',
      'confirmPassword',
    ]);
    if (isValid) setCurrentStep(2);
  };

  // Reusable label component to avoid repeating styles
  const FieldLabel = ({ label, hasError }: { label: string; hasError: boolean }) => (
    <Text
      style={{
        fontSize: 12,
        color: hasError ? colors.error : colors.textSecondary,
        marginBottom: 4,
        fontWeight: '500',
      }}
    >
      {label}
    </Text>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
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
          {/* Card */}
          <View
            style={{
              width: isWeb ? 480 : '100%',
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              padding: isWeb ? spacing.xl : spacing.lg,
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
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>
                Business Hub
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                CRM & ERP Platform
              </Text>
            </View>

            {/* Step indicator */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.textPrimary }}>
                {currentStep === 1 ? 'Create your account' : 'Set up your company'}
              </Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                Step {currentStep} of 2
              </Text>
            </View>

            <View style={{ gap: spacing.sm }}>
              {/* ── STEP 1 — Personal info ── */}
              {currentStep === 1 && (
                <>
                  {/* First name */}
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <FieldLabel label="First name" hasError={!!errors.firstName} />
                        <TextInput
                          mode="outlined"
                          autoComplete="given-name"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          error={!!errors.firstName}
                          outlineColor={colors.border}
                          activeOutlineColor={colors.primary}
                          label=""
                          style={{ backgroundColor: colors.surface }}
                        />
                      </View>
                    )}
                  />
                  {errors.firstName && (
                    <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
                      {errors.firstName.message}
                    </Text>
                  )}

                  {/* Last name */}
                  <Controller
                    control={control}
                    name="lastName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <FieldLabel label="Last name" hasError={!!errors.lastName} />
                        <TextInput
                          mode="outlined"
                          autoComplete="family-name"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          error={!!errors.lastName}
                          outlineColor={colors.border}
                          activeOutlineColor={colors.primary}
                          label=""
                          style={{ backgroundColor: colors.surface }}
                        />
                      </View>
                    )}
                  />
                  {errors.lastName && (
                    <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
                      {errors.lastName.message}
                    </Text>
                  )}

                  {/* Email */}
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <FieldLabel label="Email" hasError={!!errors.email} />
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

                  {/* Password */}
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <FieldLabel label="Password" hasError={!!errors.password} />
                        <TextInput
                          mode="outlined"
                          secureTextEntry={!showPassword}
                          autoComplete="new-password"
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

                  {/* Confirm password */}
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <FieldLabel label="Confirm password" hasError={!!errors.confirmPassword} />
                        <TextInput
                          mode="outlined"
                          secureTextEntry={!showConfirmPassword}
                          autoComplete="new-password"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          error={!!errors.confirmPassword}
                          outlineColor={colors.border}
                          activeOutlineColor={colors.primary}
                          label=""
                          style={{ backgroundColor: colors.surface }}
                          right={
                            <TextInput.Icon
                              icon={showConfirmPassword ? 'eye-off' : 'eye'}
                              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            />
                          }
                        />
                      </View>
                    )}
                  />
                  {errors.confirmPassword && (
                    <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
                      {errors.confirmPassword.message}
                    </Text>
                  )}

                  {/* Next step button */}
                  <Button
                    mode="contained"
                    onPress={goToNextStep}
                    buttonColor={colors.primary}
                    style={{ marginTop: spacing.md, borderRadius: radius.sm }}
                    contentStyle={{ paddingVertical: 6 }}
                  >
                    Next
                  </Button>
                </>
              )}

              {/* ── STEP 2 — Company info ── */}
              {currentStep === 2 && (
                <>
                  {/* Company name */}
                  <Controller
                    control={control}
                    name="companyName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <FieldLabel label="Company name" hasError={!!errors.companyName} />
                        <TextInput
                          mode="outlined"
                          autoCapitalize="words"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          error={!!errors.companyName}
                          outlineColor={colors.border}
                          activeOutlineColor={colors.primary}
                          label=""
                          style={{ backgroundColor: colors.surface }}
                        />
                      </View>
                    )}
                  />
                  {errors.companyName && (
                    <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
                      {errors.companyName.message}
                    </Text>
                  )}

                  {/* Company slug */}
                  <Controller
                    control={control}
                    name="companySlug"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <View>
                        <FieldLabel
                          label="Company URL identifier"
                          hasError={!!errors.companySlug}
                        />
                        <TextInput
                          mode="outlined"
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholder="e.g. my-company"
                          value={value}
                          onBlur={onBlur}
                          onChangeText={onChange}
                          error={!!errors.companySlug}
                          outlineColor={colors.border}
                          activeOutlineColor={colors.primary}
                          label=""
                          style={{ backgroundColor: colors.surface }}
                        />
                      </View>
                    )}
                  />
                  {errors.companySlug && (
                    <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
                      {errors.companySlug.message}
                    </Text>
                  )}

                  {/* Back button */}
                  <TouchableOpacity
                    onPress={() => setCurrentStep(1)}
                    style={{ alignItems: 'center', marginTop: spacing.sm }}
                  >
                    <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                      ← Back to personal info
                    </Text>
                  </TouchableOpacity>

                  {/* Submit button */}
                  <Button
                    mode="contained"
                    onPress={handleSubmit(onSubmit)}
                    loading={isLoading || isSubmitting}
                    disabled={isLoading || isSubmitting}
                    buttonColor={colors.primary}
                    style={{ marginTop: spacing.sm, borderRadius: radius.sm }}
                    contentStyle={{ paddingVertical: 6 }}
                  >
                    Create account
                  </Button>
                </>
              )}

              {/* Link to login */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginTop: spacing.md,
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
                <Link href="/(auth)/login">
                  <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign in</Text>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
