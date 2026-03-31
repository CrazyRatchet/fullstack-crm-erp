// app/(app)/customers/[id]/contacts/[contactId]/edit.tsx
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, updateContact } from '@/src/services/customerService';
import ContactForm, { ContactFormData } from '@/src/components/customers/ContactForm';
import { useSnackbar } from '@/src/context/SnackbarContext';
import { colors, spacing } from '@/src/constants/theme';

export default function EditContactScreen() {
  const { id, contactId } = useLocalSearchParams<{ id: string; contactId: string }>();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // We fetch the contacts list and find the one we need
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', id],
    queryFn: () => getContacts(id),
    enabled: !!id,
  });

  const contact = contacts?.results.find((c) => c.id === contactId);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: ContactFormData) => updateContact(contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', id] });
    },
  });

  const handleSubmit = async (data: ContactFormData) => {
    try {
      await mutateAsync(data);
      showSnackbar('Contact updated successfully');
      router.back();
    } catch (error: any) {
      const details = error?.response?.data?.error?.details;
      if (details) {
        const firstField = Object.keys(details)[0];
        const firstMessage = details[firstField]?.[0] ?? 'Validation error';
        showSnackbar(`${firstField}: ${firstMessage}`);
      } else {
        showSnackbar('Failed to update contact. Please try again.');
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

  if (!contact) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.error }}>Contact not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Contact</Text>
        <Text style={styles.subtitle}>
          {contact.first_name} {contact.last_name}
        </Text>
      </View>
      <ContactForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        defaultValues={contact}
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
