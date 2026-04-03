// app/(app)/leads/new.tsx
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLead } from '@/src/services/leadService';
import LeadForm, { LeadFormData } from '@/src/components/leads/LeadForm';
import { useSnackbar } from '@/src/context/SnackbarContext';
import { colors } from '@/src/constants/theme';

export default function NewLeadScreen() {
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      // Invalidate all lead stage queries so kanban refreshes
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const handleSubmit = async (data: LeadFormData) => {
    try {
      await mutateAsync(data);
      showSnackbar('Lead created successfully');
      router.back();
    } catch (error: any) {
      const details = error?.response?.data?.error?.details;
      if (details) {
        const firstField = Object.keys(details)[0];
        const firstMessage = details[firstField]?.[0] ?? 'Validation error';
        showSnackbar(`${firstField}: ${firstMessage}`);
      } else {
        showSnackbar('Failed to create lead. Please try again.');
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-6 pb-2">
        <Text className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
          New Lead
        </Text>
        <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
          Fill in the lead details below
        </Text>
      </View>

      <LeadForm onSubmit={handleSubmit} isLoading={isPending} submitLabel="Create Lead" />
    </View>
  );
}
