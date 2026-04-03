// app/(app)/customers/index.tsx
import { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Searchbar, FAB, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, Customer } from '@/src/services/customerService';
import CustomerCard from '@/src/components/customers/CustomerCard';
import { colors, spacing, radius } from '@/src/constants/theme';

export default function CustomerListScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', search, activeFilter],
    queryFn: () => getCustomers({ search, is_active: activeFilter }),
  });

  const handleFilterPress = (value: boolean | undefined) => {
    // Toggle filter off if already selected
    setActiveFilter((prev) => (prev === value ? undefined : value));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Text style={styles.subtitle}>
          {data?.count ?? 0} {data?.count === 1 ? 'customer' : 'customers'}
        </Text>
      </View>

      {/* Search bar */}
      <Searchbar
        placeholder="Search customers..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchbar}
        inputStyle={{ color: colors.textPrimary }}
      />

      {/* Filters */}
      <View style={styles.filters}>
        <Chip
          selected={activeFilter === true}
          onPress={() => handleFilterPress(true)}
          style={styles.chip}
          selectedColor={colors.success}
        >
          Active
        </Chip>
        <Chip
          selected={activeFilter === false}
          onPress={() => handleFilterPress(false)}
          style={styles.chip}
          selectedColor={colors.error}
        >
          Inactive
        </Chip>
      </View>

      {/* List */}
      {isError ? (
        <View style={styles.centered}>
          <Text style={{ color: colors.error }}>Failed to load customers.</Text>
        </View>
      ) : (
        <FlatList
          data={data?.results ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CustomerCard
              customer={item}
              onPress={(customer: Customer) => router.push(`/(app)/customers/${customer.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.centered}>
                <Text style={{ color: colors.textSecondary }}>No customers found.</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* FAB — create new customer */}
      <FAB
        icon="plus"
        style={styles.fab}
        color={colors.surface}
        onPress={() => router.push('/(app)/customers/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchbar: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surface,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
