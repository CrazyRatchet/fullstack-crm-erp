// app/(app)/leads/index.tsx
import { View, Text, ScrollView, FlatList } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { getLeads, LeadStage, STAGES, STAGE_LABELS } from '@/src/services/leadService';
import LeadCard from '@/src/components/leads/LeadCard';
import { colors } from '@/src/constants/theme';

const STAGE_COLORS: Record<LeadStage, string> = {
  new: '#6366F1',
  contacted: '#3B82F6',
  proposal_sent: '#F59E0B',
  negotiation: '#8B5CF6',
  won: '#10B981',
  lost: '#EF4444',
};

export default function LeadPipelineScreen() {
  const results = useQueries({
    queries: STAGES.map((stage) => ({
      queryKey: ['leads', stage],
      queryFn: () => getLeads({ stage }),
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const totalLeads = results.reduce((acc, r) => acc + (r.data?.count ?? 0), 0);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-6 pb-2">
        <Text className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
          Lead Pipeline
        </Text>
        <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
          {isLoading ? 'Loading...' : `${totalLeads} leads total`}
        </Text>
      </View>

      {/* Kanban board — horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
      >
        {STAGES.map((stage, index) => {
          const result = results[index];
          const leads = result.data?.results ?? [];
          const count = result.data?.count ?? 0;

          return (
            <View
              key={stage}
              className="w-52 bg-white rounded-xl border border-gray-200 overflow-hidden"
              style={{ maxHeight: '85%' }}
            >
              {/* Column header */}
              <View
                className="px-3 py-2 bg-white"
                style={{ borderTopWidth: 3, borderTopColor: STAGE_COLORS[stage] }}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-bold" style={{ color: colors.textPrimary }}>
                    {STAGE_LABELS[stage]}
                  </Text>
                  <View
                    className="w-5 h-5 rounded-full items-center justify-center"
                    style={{ backgroundColor: STAGE_COLORS[stage] }}
                  >
                    <Text className="text-xs font-bold text-white">{count}</Text>
                  </View>
                </View>
              </View>

              {/* Cards */}
              <FlatList
                data={leads}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <LeadCard lead={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 8, paddingBottom: 16 }}
                ListEmptyComponent={
                  <Text
                    className="text-xs text-center py-4 px-2"
                    style={{ color: colors.textSecondary }}
                  >
                    {result.isLoading ? 'Loading...' : 'No leads'}
                  </Text>
                }
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
