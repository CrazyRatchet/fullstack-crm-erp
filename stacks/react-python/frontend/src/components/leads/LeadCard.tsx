// src/components/leads/LeadCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/src/constants/theme';
import { Lead, STAGE_COLORS, STAGE_LABELS } from '@/src/services/leadService';
import { Calendar, DollarSign, User } from 'lucide-react-native';

interface LeadCardProps {
  lead: Lead;
  onPress?: (lead: Lead) => void;
}

const formatValue = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(num);
};

export default function LeadCard({ lead, onPress }: LeadCardProps) {
  const stageColor = STAGE_COLORS[lead.stage];

  return (
    <TouchableOpacity
      onPress={() => onPress?.(lead)}
      disabled={!onPress}
      className="bg-white rounded-xl p-3 mb-2 border border-gray-100 active:opacity-80"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Stage badge + customer */}
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-xs font-medium flex-1 mr-2" style={{ color: colors.textSecondary }}>
          {typeof lead.customer === 'object' ? lead.customer.name : ''}
        </Text>
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${stageColor}20` }}>
          <Text className="text-xs font-semibold" style={{ color: stageColor }}>
            {STAGE_LABELS[lead.stage]}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text
        className="text-sm font-bold mb-2"
        style={{ color: colors.textPrimary }}
        numberOfLines={2}
      >
        {lead.title}
      </Text>

      {/* Divider */}
      <View className="border-t border-gray-100 mb-2" />

      {/* Value */}
      <View className="flex-row items-center gap-1 mb-1">
        <DollarSign size={12} color={colors.success} />
        <Text className="text-sm font-bold" style={{ color: colors.success }}>
          {formatValue(lead.value)}
        </Text>
      </View>

      {/* Close date */}
      <View className="flex-row items-center gap-1 mb-1">
        <Calendar size={12} color={colors.textSecondary} />
        <Text className="text-xs" style={{ color: colors.textSecondary }}>
          {lead.expected_close_date}
        </Text>
      </View>

      {/* Assigned to */}
      {lead.assigned_to && (
        <View className="flex-row items-center gap-1">
          <User size={12} color={colors.textSecondary} />
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {typeof lead.assigned_to === 'object' ? lead.assigned_to.email : lead.assigned_to}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
