// src/components/customers/ContactCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/src/constants/theme';
import { Contact } from '@/src/services/customerService';

interface ContactCardProps {
  contact: Contact;
  onPress?: () => void;
}

export default function ContactCard({ contact, onPress }: ContactCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="bg-white rounded-xl p-4 mb-2 border border-gray-200"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
          {contact.first_name} {contact.last_name}
        </Text>
        {contact.position ? (
          <Text className="text-xs" style={{ color: colors.textSecondary }}>
            {contact.position}
          </Text>
        ) : null}
      </View>
      {contact.email ? (
        <Text className="text-sm mb-0.5" style={{ color: colors.textSecondary }}>
          {contact.email}
        </Text>
      ) : null}
      {contact.phone ? (
        <Text className="text-sm" style={{ color: colors.textSecondary }}>
          {contact.phone}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}
