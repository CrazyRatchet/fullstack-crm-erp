// app/(app)/customers/[id]/edit.tsx
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomer, updateCustomer } from '@/src/services/customerService';
import CustomerForm, { CustomerFormData } from '@/src/components/customers/CustomerForm';
import { useSnackbar } from '@/src/context/SnackbarContext';
import { colors, spacing } from '@/src/constants/theme';

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: CustomerFormData) => updateCustomer(id, data),
    onSuccess: () => {
      // Invalidate both the list and the detail cache
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
  });

  const handleSubmit = async (data: CustomerFormData) => {
    try {
      await mutateAsync(data);
      showSnackbar('Customer updated successfully');
      router.back();
    } catch (error: any) {
      const details = error?.response?.data?.error?.details;
      if (details) {
        const firstField = Object.keys(details)[0];
        const firstMessage = details[firstField]?.[0] ?? 'Validation error';
        showSnackbar(`${firstField}: ${firstMessage}`);
      } else {
        showSnackbar('Failed to update customer. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Edit Customer</Text>
        <Text style={styles.subtitle}>{customer?.name}</Text>
      </View>

      <CustomerForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        defaultValues={customer}
        submitLabel="Save Changes"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
