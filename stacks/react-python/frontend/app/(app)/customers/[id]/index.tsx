// app/(app)/customers/[id]/index.tsx
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Portal } from 'react-native-paper';
import { useState } from 'react';
import { getCustomer, getContacts, deactivateCustomer } from '@/src/services/customerService';
import ContactCard from '@/src/components/customers/ContactCard';
import { useSnackbar } from '@/src/context/SnackbarContext';
import { colors, spacing, radius } from '@/src/constants/theme';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });

  const { data: contacts, isLoading: loadingContacts } = useQuery({
    queryKey: ['contacts', id],
    queryFn: () => getContacts(id),
    enabled: !!id,
  });

  const { mutateAsync: deactivate, isPending: deactivating } = useMutation({
    mutationFn: () => deactivateCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
  });

  const handleDeactivate = async () => {
    setConfirmVisible(false);
    try {
      await deactivate();
      showSnackbar('Customer deactivated successfully');
    } catch {
      showSnackbar('Failed to deactivate customer.');
    }
  };

  if (loadingCustomer) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: colors.error }}>Customer not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Customer info card */}
      <View style={styles.card}>
        {/* Name + badge */}
        <View style={styles.nameRow}>
          <Text style={styles.name}>{customer.name}</Text>
          <View
            style={[styles.badge, { backgroundColor: customer.is_active ? '#D1FAE5' : '#FEE2E2' }]}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: customer.is_active ? colors.success : colors.error,
              }}
            >
              {customer.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>

        {/* Fields */}
        {customer.email ? <Text style={styles.field}>{customer.email}</Text> : null}
        {customer.phone ? <Text style={styles.field}>{customer.phone}</Text> : null}
        {customer.address ? (
          <Text style={[styles.field, { marginTop: spacing.xs }]}>{customer.address}</Text>
        ) : null}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => router.push(`/(app)/customers/${id}/edit`)}
          style={[styles.button, { borderColor: colors.primary }]}
          textColor={colors.primary}
        >
          Edit
        </Button>
        {customer.is_active && (
          <Button
            mode="outlined"
            onPress={() => setConfirmVisible(true)}
            loading={deactivating}
            disabled={deactivating}
            style={[styles.button, { borderColor: colors.error }]}
            textColor={colors.error}
          >
            Deactivate
          </Button>
        )}
      </View>

      {/* Contacts section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Contacts {contacts?.count ? `(${contacts.count})` : ''}
        </Text>
        {loadingContacts ? (
          <Text style={{ color: colors.textSecondary }}>Loading contacts...</Text>
        ) : contacts?.results.length ? (
          contacts.results.map((contact) => <ContactCard key={contact.id} contact={contact} />)
        ) : (
          <Text style={{ color: colors.textSecondary }}>No contacts found.</Text>
        )}
      </View>

      {/* Confirmation dialog */}
      <Portal>
        <Dialog visible={confirmVisible} onDismiss={() => setConfirmVisible(false)}>
          <Dialog.Title>Deactivate Customer</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to deactivate {customer.name}? They will no longer appear in
              active customer lists.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmVisible(false)}>Cancel</Button>
            <Button textColor={colors.error} onPress={handleDeactivate}>
              Deactivate
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  field: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  button: {
    flex: 1,
    borderRadius: radius.sm,
  },
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
});
