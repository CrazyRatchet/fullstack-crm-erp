// src/components/leads/LeadForm.tsx
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextInput, Button, Menu } from 'react-native-paper';
import { useState } from 'react';
import { colors, spacing, radius } from '@/src/constants/theme';
import { Lead, LeadStage, STAGES, STAGE_LABELS } from '@/src/services/leadService';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '@/src/services/customerService';

// --- VALIDATION SCHEMA ---
const leadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.string().min(1, 'Value is required'),
  stage: z.enum(['new', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost']),
  expected_close_date: z
    .string()
    .min(1, 'Expected close date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  customer: z.string().min(1, 'Customer is required'),
  assigned_to: z.string().optional(),
});

// --- TYPES ---
export type LeadFormData = z.infer<typeof leadSchema>;

// --- PROPS ---
interface LeadFormProps {
  onSubmit: (data: LeadFormData) => Promise<void>;
  isLoading?: boolean;
  defaultValues?: Partial<Lead>;
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

export default function LeadForm({
  onSubmit,
  isLoading = false,
  defaultValues,
  submitLabel = 'Save',
}: LeadFormProps) {
  const [stageMenuVisible, setStageMenuVisible] = useState(false);
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);

  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getCustomers({ is_active: true }),
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      value: defaultValues?.value ?? '',
      stage: (defaultValues?.stage as LeadStage) ?? 'new',
      expected_close_date: defaultValues?.expected_close_date ?? '',
      customer:
        typeof defaultValues?.customer === 'object'
          ? defaultValues.customer.id
          : (defaultValues?.customer ?? ''),
      assigned_to:
        typeof defaultValues?.assigned_to === 'string'
          ? defaultValues.assigned_to
          : (defaultValues?.assigned_to?.id ?? ''),
    },
  });

  const selectedStage = watch('stage');
  const selectedCustomer = watch('customer');
  const selectedCustomerName = customersData?.results.find((c) => c.id === selectedCustomer)?.name;

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
          {/* Title */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <FieldLabel label="Title *" hasError={!!errors.title} />
                <TextInput
                  mode="outlined"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.title}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  label=""
                  style={{ backgroundColor: colors.surface }}
                />
              </View>
            )}
          />
          {errors.title && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
              {errors.title.message}
            </Text>
          )}

          {/* Value */}
          <Controller
            control={control}
            name="value"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <FieldLabel label="Value (USD) *" hasError={!!errors.value} />
                <TextInput
                  mode="outlined"
                  keyboardType="decimal-pad"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.value}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  label=""
                  style={{ backgroundColor: colors.surface }}
                  left={<TextInput.Affix text="$" />}
                />
              </View>
            )}
          />
          {errors.value && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
              {errors.value.message}
            </Text>
          )}

          {/* Stage selector */}
          <View>
            <FieldLabel label="Stage *" hasError={!!errors.stage} />
            <Menu
              visible={stageMenuVisible}
              onDismiss={() => setStageMenuVisible(false)}
              anchor={
                <TextInput
                  mode="outlined"
                  value={STAGE_LABELS[selectedStage]}
                  editable={false}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  label=""
                  style={{ backgroundColor: colors.surface }}
                  right={
                    <TextInput.Icon icon="chevron-down" onPress={() => setStageMenuVisible(true)} />
                  }
                  onPressIn={() => setStageMenuVisible(true)}
                />
              }
            >
              {STAGES.map((stage) => (
                <Menu.Item
                  key={stage}
                  onPress={() => {
                    setValue('stage', stage);
                    setStageMenuVisible(false);
                  }}
                  title={STAGE_LABELS[stage]}
                />
              ))}
            </Menu>
          </View>

          {/* Expected close date */}
          <Controller
            control={control}
            name="expected_close_date"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <FieldLabel label="Expected Close Date *" hasError={!!errors.expected_close_date} />
                <TextInput
                  mode="outlined"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.expected_close_date}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  label=""
                  style={{ backgroundColor: colors.surface }}
                />
              </View>
            )}
          />
          {errors.expected_close_date && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
              {errors.expected_close_date.message}
            </Text>
          )}

          {/* Customer selector */}
          <View>
            <FieldLabel label="Customer *" hasError={!!errors.customer} />
            <Menu
              visible={customerMenuVisible}
              onDismiss={() => setCustomerMenuVisible(false)}
              anchor={
                <TextInput
                  mode="outlined"
                  value={selectedCustomerName ?? ''}
                  placeholder="Select a customer"
                  editable={false}
                  error={!!errors.customer}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  label=""
                  style={{ backgroundColor: colors.surface }}
                  right={
                    <TextInput.Icon
                      icon="chevron-down"
                      onPress={() => setCustomerMenuVisible(true)}
                    />
                  }
                  onPressIn={() => setCustomerMenuVisible(true)}
                />
              }
            >
              {customersData?.results.map((customer) => (
                <Menu.Item
                  key={customer.id}
                  onPress={() => {
                    setValue('customer', customer.id);
                    setCustomerMenuVisible(false);
                  }}
                  title={customer.name}
                />
              ))}
            </Menu>
          </View>
          {errors.customer && (
            <Text style={{ color: colors.error, fontSize: 12, marginTop: -4 }}>
              {errors.customer.message}
            </Text>
          )}

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
