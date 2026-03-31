// src/components/customers/ContactForm.tsx
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, Button } from 'react-native-paper';
import { colors, spacing, radius } from '@/src/constants/theme';
import { Contact } from '@/src/services/customerService';

// --- VALIDATION SCHEMA ---
const contactSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address').or(z.literal('')),
  phone: z.string(),
  position: z.string(),
});

// --- TYPES ---
export type ContactFormData = z.infer<typeof contactSchema>;

// --- PROPS ---
interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<Contact>;
  submitLabel?: string;
}

// Reusable field label — same pattern as other forms
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

export default function ContactForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitLabel = 'Save',
}: ContactFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: defaultValues?.first_name ?? '',
      last_name: defaultValues?.last_name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      position: defaultValues?.position ?? '',
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.md }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.sm }}>
          {/* First name */}
          <Controller
            control={control}
            name="first_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <FieldLabel label="First name *" hasError={!!errors.first_name} />
                <TextInput
                  mode="outlined"
                  autoCapitalize="words"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.first_name}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  label=""
                  style={{ backgroundColor: colors.surface }}
                />
              </View>
            )}
          />
          {errors.first_name && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
              {errors.first_name.message}
            </Text>
          )}

          {/* Last name */}
          <Controller
            control={control}
            name="last_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <FieldLabel label="Last name *" hasError={!!errors.last_name} />
                <TextInput
                  mode="outlined"
                  autoCapitalize="words"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.last_name}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  label=""
                  style={{ backgroundColor: colors.surface }}
                />
              </View>
            )}
          />
          {errors.last_name && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
              {errors.last_name.message}
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

          {/* Position */}
          <Controller
            control={control}
            name="position"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <FieldLabel label="Position" hasError={!!errors.position} />
                <TextInput
                  mode="outlined"
                  autoCapitalize="words"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.position}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
