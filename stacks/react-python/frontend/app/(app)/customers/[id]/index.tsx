// app/(app)/customers/[id]/index.tsx
import { View, Text, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Portal } from 'react-native-paper';
import { useState } from 'react';
import { getCustomer, getContacts, deactivateCustomer } from '@/src/services/customerService';
import ContactCard from '@/src/components/customers/ContactCard';
import { useSnackbar } from '@/src/context/SnackbarContext';
import { colors } from '@/src/constants/theme';

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
      <View className="flex-1 items-center justify-center">
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text style={{ color: colors.error }}>Customer not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4 pb-10">
        {/* Customer info card */}
        <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          {/* Name + badge */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-2xl font-bold flex-1" style={{ color: colors.textPrimary }}>
              {customer.name}
            </Text>
            <View
              className="px-3 py-0.5 rounded-full"
              style={{ backgroundColor: customer.is_active ? '#D1FAE5' : '#FEE2E2' }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: customer.is_active ? colors.success : colors.error }}
              >
                {customer.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {customer.email ? (
            <Text className="text-sm mb-0.5" style={{ color: colors.textSecondary }}>
              {customer.email}
            </Text>
          ) : null}
          {customer.phone ? (
            <Text className="text-sm mb-0.5" style={{ color: colors.textSecondary }}>
              {customer.phone}
            </Text>
          ) : null}
          {customer.address ? (
            <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              {customer.address}
            </Text>
          ) : null}
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-3 mb-6">
          <Button
            mode="outlined"
            onPress={() => router.push(`/(app)/customers/${id}/edit`)}
            style={{ flex: 1, borderRadius: 8, borderColor: colors.primary }}
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
              style={{ flex: 1, borderRadius: 8, borderColor: colors.error }}
              textColor={colors.error}
            >
              Deactivate
            </Button>
          )}
        </View>

        {/* Contacts section */}
        <View className="mt-2">
          {/* Section header */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              Contacts {contacts?.count ? `(${contacts.count})` : ''}
            </Text>
            <Button
              mode="contained"
              compact
              buttonColor={colors.primary}
              onPress={() => router.push(`/(app)/customers/${id}/contacts/new`)}
            >
              Add
            </Button>
          </View>

          {loadingContacts ? (
            <Text style={{ color: colors.textSecondary }}>Loading contacts...</Text>
          ) : contacts?.results.length ? (
            contacts.results.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onPress={() => router.push(`/(app)/customers/${id}/contacts/${contact.id}/edit`)}
              />
            ))
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
      </View>
    </ScrollView>
  );
}
