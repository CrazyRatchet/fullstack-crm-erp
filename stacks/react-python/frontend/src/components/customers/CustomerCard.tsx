// src/components/customers/CustomerCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/src/constants/theme';
import { Customer } from '@/src/services/customerService';
import { Mail, Phone } from 'lucide-react-native';

interface CustomerCardProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
}

export default function CustomerCard({ customer, onPress }: CustomerCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(customer)}
      className="bg-white rounded-xl p-4 mb-2 border border-gray-100 active:opacity-80"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Header row — name + active badge */}
      <View className="flex-row justify-between items-center mb-2">
        <Text
          className="text-base font-semibold flex-1 mr-2"
          style={{ color: colors.textPrimary }}
          numberOfLines={1}
        >
          {customer.name}
        </Text>
        <View
          className="px-2 py-0.5 rounded-full"
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

      {/* Divider */}
      <View className="border-t border-gray-100 mb-2" />

      {/* Email */}
      {customer.email ? (
        <View className="flex-row items-center gap-2 mb-1">
          <Mail size={12} color={colors.textSecondary} />
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {customer.email}
          </Text>
        </View>
      ) : null}

      {/* Phone */}
      {customer.phone ? (
        <View className="flex-row items-center gap-2 mb-1">
          <Phone size={12} color={colors.textSecondary} />
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {customer.phone}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
