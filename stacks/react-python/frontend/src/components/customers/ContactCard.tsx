// src/components/customers/ContactCard.tsx
import { View, Text } from 'react-native';
import { colors, spacing, radius } from '@/src/constants/theme';
import { Contact } from '@/src/services/customerService';

interface ContactCardProps {
  contact: Contact;
}

export default function ContactCard({ contact }: ContactCardProps) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Full name + position */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xs,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
          {contact.first_name} {contact.last_name}
        </Text>
        {contact.position ? (
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>{contact.position}</Text>
        ) : null}
      </View>

      {/* Email */}
      {contact.email ? (
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 2 }}>
          {contact.email}
        </Text>
      ) : null}

      {/* Phone */}
      {contact.phone ? (
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>{contact.phone}</Text>
      ) : null}
    </View>
  );
}
