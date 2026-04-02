// app/(app)/index.tsx
import { View, Text, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/src/services/dashboardService';
import { colors } from '@/src/constants/theme';
import { STAGE_LABELS, STAGE_COLORS } from '@/src/services/leadService';

// Reusable metric card component
function MetricCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}) {
  return (
    <View
      className="bg-white rounded-xl p-4 border border-gray-200"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
        {title}
      </Text>
      <Text className="text-3xl font-bold" style={{ color: color ?? colors.textPrimary }}>
        {value}
      </Text>
      {subtitle ? (
        <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

// Format decimal value as currency
const formatCurrency = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(num);
};

export default function DashboardScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
  });

  const totalActiveLeads = data
    ? Object.values(data.active_leads).reduce((acc, val) => acc + val, 0)
    : 0;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 pt-6 pb-10">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
            Dashboard
          </Text>
          <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
            Business overview
          </Text>
        </View>

        {/* Top metrics */}
        <View className="gap-3 mb-6">
          <MetricCard
            title="Total Customers"
            value={isLoading ? '...' : (data?.total_customers ?? 0)}
            subtitle="Registered customers"
            color={colors.primary}
          />
          <MetricCard
            title="Active Leads"
            value={isLoading ? '...' : totalActiveLeads}
            subtitle="Leads in pipeline"
            color={colors.warning}
          />
          <MetricCard
            title="Pipeline Value"
            value={isLoading ? '...' : formatCurrency(data?.leads_total_value ?? '0')}
            subtitle="Total leads value"
            color={colors.success}
          />
        </View>

        {/* Leads by stage */}
        <View className="mb-2">
          <Text className="text-lg font-semibold mb-3" style={{ color: colors.textPrimary }}>
            Leads by Stage
          </Text>
          <View className="gap-2">
            {data
              ? Object.entries(data.active_leads).map(([stage, count]) => (
                  <View
                    key={stage}
                    className="bg-white rounded-xl px-4 py-3 border border-gray-200 flex-row justify-between items-center"
                  >
                    <View className="flex-row items-center gap-2">
                      <View
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            STAGE_COLORS[stage as keyof typeof STAGE_COLORS] ?? colors.primary,
                        }}
                      />
                      <Text style={{ color: colors.textPrimary, fontSize: 14 }}>
                        {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ?? stage}
                      </Text>
                    </View>
                    <Text className="font-bold" style={{ color: colors.textPrimary }}>
                      {count}
                    </Text>
                  </View>
                ))
              : null}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
