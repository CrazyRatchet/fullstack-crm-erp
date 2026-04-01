// src/components/leads/LeadCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/src/constants/theme';
import { Lead, STAGE_LABELS } from '@/src/services/leadService';

interface LeadCardProps {
  lead: Lead;
  onPress?: (lead: Lead) => void;
}

// Format decimal value as currency
const formatValue = (value: string) => {
  const num = parseFloat(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(num);
};

export default function LeadCard({ lead, onPress }: LeadCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(lead)}
      disabled={!onPress}
      className="bg-white rounded-xl p-3 mb-2 border border-gray-200"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Title */}
      <Text
        className="text-sm font-semibold mb-1"
        style={{ color: colors.textPrimary }}
        numberOfLines={2}
      >
        {lead.title}
      </Text>

      {/* Value */}
      <Text className="text-base font-bold" style={{ color: colors.primary }}>
        {formatValue(lead.value)}
      </Text>

      {/* Expected close date */}
      <Text className="text-xs mt-1" style={{ color: colors.textSecondary }}>
        {lead.expected_close_date}
      </Text>
    </TouchableOpacity>
  );
}
