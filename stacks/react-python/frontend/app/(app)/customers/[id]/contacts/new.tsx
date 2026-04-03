// app/(app)/customers/[id]/contacts/new.tsx
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createContact } from '@/src/services/customerService';
import ContactForm, { ContactFormData } from '@/src/components/customers/ContactForm';
import { useSnackbar } from '@/src/context/SnackbarContext';
import { colors, spacing } from '@/src/constants/theme';

export default function NewContactScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: ContactFormData) => createContact(id, data),
    onSuccess: () => {
      // Invalidate contacts list so it refetches with the new contact
      queryClient.invalidateQueries({ queryKey: ['contacts', id] });
    },
  });

  const handleSubmit = async (data: ContactFormData) => {
    try {
      await mutateAsync(data);
      showSnackbar('Contact created successfully');
      router.back();
    } catch (error: any) {
      const details = error?.response?.data?.error?.details;
      if (details) {
        const firstField = Object.keys(details)[0];
        const firstMessage = details[firstField]?.[0] ?? 'Validation error';
        showSnackbar(`${firstField}: ${firstMessage}`);
      } else {
        showSnackbar('Failed to create contact. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Contact</Text>
        <Text style={styles.subtitle}>Add a contact to this customer</Text>
      </View>
      <ContactForm onSubmit={handleSubmit} isLoading={isPending} submitLabel="Create Contact" />
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
