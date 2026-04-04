// app/(app)/leads/index.tsx
import { View, Text, ScrollView, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  getLeads,
  LeadStage,
  STAGES,
  STAGE_LABELS,
  STAGE_COLORS,
  Lead,
} from '@/src/services/leadService';
import LeadCard from '@/src/components/leads/LeadCard';
import { colors } from '@/src/constants/theme';
import { Chip, FAB } from 'react-native-paper';
import { useState } from 'react';
import { router } from 'expo-router';

const formatValue = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(num);
};

export default function LeadPipelineScreen() {
  const [activeStage, setActiveStage] = useState<LeadStage | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => getLeads(),
  });

  // Group leads by stage
  const leadsByStage = STAGES.reduce<Record<LeadStage, Lead[]>>(
    (acc, stage) => {
      acc[stage] = data?.results.filter((lead) => lead.stage === stage) ?? [];
      return acc;
    },
    {} as Record<LeadStage, Lead[]>,
  );

  const totalLeads = data?.count ?? 0;

  // Total pipeline value
  const totalValue = data?.results.reduce((acc, lead) => acc + parseFloat(lead.value), 0) ?? 0;

  // Active leads (not won or lost)
  const activeLeads =
    data?.results.filter((lead) => lead.stage !== 'won' && lead.stage !== 'lost').length ?? 0;

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

      {/* Metric cards */}
      <View className="flex-row px-4 gap-3 mb-3">
        {/* Total leads */}
        <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100">
          <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
            Total Leads
          </Text>
          <Text className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>
            {isLoading ? '...' : totalLeads}
          </Text>
        </View>

        {/* Active leads */}
        <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100">
          <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
            Active
          </Text>
          <Text className="text-2xl font-bold mt-1" style={{ color: colors.warning }}>
            {isLoading ? '...' : activeLeads}
          </Text>
        </View>

        {/* Pipeline value */}
        <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100">
          <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
            Value
          </Text>
          <Text className="text-lg font-bold mt-1" style={{ color: colors.success }}>
            {isLoading ? '...' : formatValue(String(totalValue))}
          </Text>
        </View>
      </View>

      {/* Stage filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}
      >
        {STAGES.map((stage) => (
          <Chip
            key={stage}
            selected={activeStage === stage}
            onPress={() => setActiveStage((prev) => (prev === stage ? undefined : stage))}
            style={{ backgroundColor: colors.surface }}
            selectedColor={STAGE_COLORS[stage]}
          >
            {STAGE_LABELS[stage]}
          </Chip>
        ))}
      </ScrollView>

      {/* Kanban board */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32, gap: 12 }}
      >
        {STAGES.filter((stage) => activeStage === undefined || activeStage === stage).map(
          (stage) => {
            const leads = leadsByStage[stage] ?? [];
            const count = leads.length;

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
                  renderItem={({ item }) => (
                    <LeadCard
                      lead={item}
                      onPress={() =>
                        router.push({ pathname: '/(app)/leads/[id]/edit', params: { id: item.id } })
                      }
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ padding: 8, paddingBottom: 16 }}
                  ListEmptyComponent={
                    <Text
                      className="text-xs text-center py-4 px-2"
                      style={{ color: colors.textSecondary }}
                    >
                      {isLoading ? 'Loading...' : 'No leads'}
                    </Text>
                  }
                />
              </View>
            );
          },
        )}
      </ScrollView>

      <FAB
        icon="plus"
        label="New Lead"
        onPress={() => router.push('/(app)/leads/new')}
        style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: colors.primary }}
        color="#ffffff"
      />
    </View>
  );
}
