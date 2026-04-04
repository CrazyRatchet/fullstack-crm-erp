// src/components/customers/CustomerForm.tsx
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, Button } from 'react-native-paper';
import { colors, spacing, radius } from '@/src/constants/theme';
import { Customer } from '@/src/services/customerService';

// --- VALIDATION SCHEMA ---
const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address').or(z.literal('')),
  phone: z.string(),
  address: z.string(),
});

// --- TYPES ---
export type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<Customer>;
  submitLabel?: string;
}

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

export default function CustomerForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitLabel = 'Save',
}: CustomerFormProps) {
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      address: defaultValues?.address ?? '',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Outer container — centers on web, fullscreen on mobile */}
        <View
          style={{
            flex: 1,
            alignItems: isWeb ? 'center' : 'stretch',
            backgroundColor: colors.background,
            padding: spacing.md,
          }}
        >
          {/* Card */}
          <View
            style={{
              width: isWeb ? 520 : '100%',
              backgroundColor: colors.surface,
              borderRadius: radius.lg,
              padding: isWeb ? spacing.xl : spacing.md,
              ...(isWeb && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 4,
              }),
            }}
          >
            <View style={{ gap: spacing.sm }}>
              {/* Name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <FieldLabel label="Name *" hasError={!!errors.name} />
                    <TextInput
                      mode="outlined"
                      autoCapitalize="words"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={!!errors.name}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      label=""
                      style={{ backgroundColor: colors.surface }}
                    />
                  </View>
                )}
              />
              {errors.name && (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
                  {errors.name.message}
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

              {/* Phone */}
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <FieldLabel label="Phone" hasError={!!errors.phone} />
                    <TextInput
                      mode="outlined"
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={!!errors.phone}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      label=""
                      style={{ backgroundColor: colors.surface }}
                    />
                  </View>
                )}
              />

              {/* Address */}
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <FieldLabel label="Address" hasError={!!errors.address} />
                    <TextInput
                      mode="outlined"
                      autoCapitalize="sentences"
                      multiline
                      numberOfLines={3}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={!!errors.address}
                      outlineColor={colors.border}
                      activeOutlineColor={colors.primary}
                      label=""
                      style={{ backgroundColor: colors.surface }}
                    />
                  </View>
                )}
              />

              {/* Submit button */}
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading || isSubmitting}
                disabled={isLoading || isSubmitting}
                buttonColor={colors.primary}
                style={{ marginTop: spacing.md, borderRadius: radius.sm }}
                contentStyle={{ paddingVertical: 6 }}
              >
                {submitLabel}
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
