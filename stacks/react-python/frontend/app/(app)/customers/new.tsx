// app/(app)/customers/new.tsx
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCustomer } from '@/src/services/customerService';
import CustomerForm, { CustomerFormData } from '@/src/components/customers/CustomerForm';
import { useSnackbar } from '@/src/context/SnackbarContext';
import { colors, spacing } from '@/src/constants/theme';

export default function NewCustomerScreen() {
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      // Invalidate the customers list so it refetches with the new customer
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await mutateAsync(data);
      showSnackbar('Customer created successfully');
      router.back();
    } catch (error: any) {
      // Handle field-level validation errors from the backend (400)
      const details = error?.response?.data?.error?.details;
      if (details) {
        const firstField = Object.keys(details)[0];
        const firstMessage = details[firstField]?.[0] ?? 'Validation error';
        showSnackbar(`${firstField}: ${firstMessage}`);
      } else {
        showSnackbar('Failed to create customer. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>New Customer</Text>
        <Text style={styles.subtitle}>Fill in the customer details below</Text>
      </View>

      <CustomerForm onSubmit={handleSubmit} isLoading={isPending} submitLabel="Create Customer" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
