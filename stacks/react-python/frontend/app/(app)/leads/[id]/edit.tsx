// app/(app)/leads/[id]/edit.tsx
import { View, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLead, updateLead } from '@/src/services/leadService';
import LeadForm, { LeadFormData } from '@/src/components/leads/LeadForm';
import { useSnackbar } from '@/src/context/SnackbarContext';
import { colors } from '@/src/constants/theme';

export default function EditLeadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLead(id),
    enabled: !!id,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (data: LeadFormData) => updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
    },
  });

  const handleSubmit = async (data: LeadFormData) => {
    try {
      await mutateAsync(data);
      showSnackbar('Lead updated successfully');
      router.back();
    } catch (error: any) {
      const details = error?.response?.data?.error?.details;
      if (details) {
        const firstField = Object.keys(details)[0];
        const firstMessage = details[firstField]?.[0] ?? 'Validation error';
        showSnackbar(`${firstField}: ${firstMessage}`);
      } else {
        showSnackbar('Failed to update lead. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text style={{ color: colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-6 pb-2">
        <Text className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
          Edit Lead
        </Text>
        <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
          {lead?.title}
        </Text>
      </View>

      <LeadForm
        onSubmit={handleSubmit}
        isLoading={isPending}
        defaultValues={lead}
        submitLabel="Save Changes"
      />
    </View>
  );
}
