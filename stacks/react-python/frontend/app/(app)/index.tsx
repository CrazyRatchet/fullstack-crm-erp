// app/(app)/index.tsx
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '@/src/services/dashboardService';
import { colors } from '@/src/constants/theme';
import { STAGE_LABELS, STAGE_COLORS } from '@/src/services/leadService';
import { Users, TrendingUp, DollarSign, Package } from 'lucide-react-native';

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

  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const totalActiveLeads = data
    ? Object.values(data.active_leads).reduce((acc, val) => acc + val, 0)
    : 0;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View
        style={{
          padding: 16,
          paddingBottom: 40,
          maxWidth: isWeb ? 960 : '100%',
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {/* Header */}
        <View className="mb-6 pt-4">
          <Text className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
            Dashboard
          </Text>
          <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
            Business overview
          </Text>
        </View>

        {/* Top metric cards — 2x2 grid on mobile, 4 columns on web */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {/* Active Customers */}
          <View
            style={{
              flex: 1,
              minWidth: isWeb ? 0 : '45%',
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mb-3"
              style={{ backgroundColor: '#EEF2FF' }}
            >
              <Users size={20} color={colors.primary} />
            </View>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Active Customers
            </Text>
            <Text className="text-3xl font-bold mt-1" style={{ color: colors.textPrimary }}>
              {isLoading ? '...' : (data?.total_customers ?? 0)}
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Total: {isLoading ? '...' : (data?.total_customers ?? 0)}
            </Text>
          </View>

          {/* Active Leads */}
          <View
            style={{
              flex: 1,
              minWidth: isWeb ? 0 : '45%',
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mb-3"
              style={{ backgroundColor: '#F5F3FF' }}
            >
              <TrendingUp size={20} color="#8B5CF6" />
            </View>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Active Leads
            </Text>
            <Text className="text-3xl font-bold mt-1" style={{ color: colors.textPrimary }}>
              {isLoading ? '...' : totalActiveLeads}
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Total: {isLoading ? '...' : totalActiveLeads}
            </Text>
          </View>

          {/* Revenue */}
          <View
            style={{
              flex: 1,
              minWidth: isWeb ? 0 : '45%',
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mb-3"
              style={{ backgroundColor: '#ECFDF5' }}
            >
              <DollarSign size={20} color={colors.success} />
            </View>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Pipeline Value
            </Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.textPrimary }}>
              {isLoading ? '...' : formatCurrency(data?.leads_total_value ?? '0')}
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
              Pending: {isLoading ? '...' : formatCurrency(data?.leads_total_value ?? '0')}
            </Text>
          </View>

          {/* Products placeholder */}
          <View
            style={{
              flex: 1,
              minWidth: isWeb ? 0 : '45%',
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mb-3"
              style={{ backgroundColor: '#FFF7ED' }}
            >
              <Package size={20} color="#F97316" />
            </View>
            <Text className="text-xs" style={{ color: colors.textSecondary }}>
              Products
            </Text>
            <Text className="text-3xl font-bold mt-1" style={{ color: colors.textPrimary }}>
              0
            </Text>
            <Text className="text-xs mt-1" style={{ color: colors.error }}>
              Low stock: 0
            </Text>
          </View>
        </View>

        {/* Bottom sections — side by side on web */}
        <View
          style={{
            flexDirection: isWeb ? 'row' : 'column',
            gap: 12,
          }}
        >
          {/* Lead Pipeline */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <Text className="text-base font-semibold mb-3" style={{ color: colors.textPrimary }}>
              Lead Pipeline
            </Text>
            <View style={{ gap: 8 }}>
              {data
                ? Object.entries(data.active_leads).map(([stage, count]) => (
                    <View
                      key={stage}
                      className="flex-row justify-between items-center py-1"
                      style={{ borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
                    >
                      <Text style={{ color: colors.textPrimary, fontSize: 13 }}>
                        {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ?? stage}
                      </Text>
                      <View
                        className="w-6 h-6 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: `${STAGE_COLORS[stage as keyof typeof STAGE_COLORS]}20`,
                        }}
                      >
                        <Text
                          className="text-xs font-bold"
                          style={{
                            color:
                              STAGE_COLORS[stage as keyof typeof STAGE_COLORS] ?? colors.primary,
                          }}
                        >
                          {count}
                        </Text>
                      </View>
                    </View>
                  ))
                : null}
            </View>
          </View>

          {/* Recent Activity placeholder */}
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}
          >
            <Text className="text-base font-semibold mb-3" style={{ color: colors.textPrimary }}>
              Recent Activity
            </Text>
            <View className="flex-1 items-center justify-center py-8">
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>No recent activity</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
