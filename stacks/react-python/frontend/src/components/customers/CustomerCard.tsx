// src/components/customers/CustomerCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '@/src/constants/theme';
import { Customer } from '@/src/services/customerService';

interface CustomerCardProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
}

export default function CustomerCard({ customer, onPress }: CustomerCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(customer)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        // Shadow for iOS/web
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Header row — name + active badge */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xs,
        }}
      >
        <Text
          style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, flex: 1 }}
          numberOfLines={1}
        >
          {customer.name}
        </Text>
        {/* Active/Inactive badge */}
        <View
          style={{
            paddingHorizontal: spacing.sm,
            paddingVertical: 2,
            borderRadius: radius.full,
            backgroundColor: customer.is_active ? '#D1FAE5' : '#FEE2E2',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: customer.is_active ? colors.success : colors.error,
            }}
          >
            {customer.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Email */}
      {customer.email ? (
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>
          {customer.email}
        </Text>
      ) : null}

      {/* Phone */}
      {customer.phone ? (
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>{customer.phone}</Text>
      ) : null}
    </TouchableOpacity>
  );
}
