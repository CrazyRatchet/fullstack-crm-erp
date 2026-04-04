// app/(app)/customers/index.tsx
import { useState } from 'react';
import { View, Text, FlatList, useWindowDimensions } from 'react-native';
import { Searchbar, FAB, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getCustomers, Customer } from '@/src/services/customerService';
import CustomerCard from '@/src/components/customers/CustomerCard';
import { colors } from '@/src/constants/theme';

export default function CustomerListScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['customers', search, activeFilter],
    queryFn: () => getCustomers({ search, is_active: activeFilter }),
  });

  const handleFilterPress = (value: boolean | undefined) => {
    setActiveFilter((prev) => (prev === value ? undefined : value));
  };

  const totalCustomers = data?.count ?? 0;
  const activeCustomers = data?.results.filter((c) => c.is_active).length ?? 0;
  const inactiveCustomers = data?.results.filter((c) => !c.is_active).length ?? 0;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-6 pb-2">
        <Text className="text-3xl font-bold" style={{ color: colors.textPrimary }}>
          Customers
        </Text>
        <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
          Manage your customer relationships
        </Text>
      </View>

      {/* Centered content container for web */}
      <View style={{ flex: 1, maxWidth: isWeb ? 800 : '100%', width: '100%', alignSelf: 'center' }}>
        {/* Metric cards */}
        <View className="flex-row px-4 gap-3 mb-3">
          <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100">
            <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
              Total
            </Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.primary }}>
              {isLoading ? '...' : totalCustomers}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100">
            <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
              Active
            </Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.success }}>
              {isLoading ? '...' : activeCustomers}
            </Text>
          </View>
          <View className="flex-1 bg-white rounded-xl p-3 border border-gray-100">
            <Text className="text-xs font-medium" style={{ color: colors.textSecondary }}>
              Inactive
            </Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.error }}>
              {isLoading ? '...' : inactiveCustomers}
            </Text>
          </View>
        </View>

        {/* Search bar */}
        <Searchbar
          placeholder="Search customers..."
          value={search}
          onChangeText={setSearch}
          style={{
            marginHorizontal: 16,
            marginBottom: 8,
            backgroundColor: colors.surface,
            borderRadius: 12,
          }}
          inputStyle={{ color: colors.textPrimary }}
        />

        {/* Filters */}
        <View className="flex-row px-4 gap-2 mb-2">
          <Chip
            selected={activeFilter === true}
            onPress={() => handleFilterPress(true)}
            style={{ backgroundColor: colors.surface }}
            selectedColor={colors.success}
          >
            Active
          </Chip>
          <Chip
            selected={activeFilter === false}
            onPress={() => handleFilterPress(false)}
            style={{ backgroundColor: colors.surface }}
            selectedColor={colors.error}
          >
            Inactive
          </Chip>
        </View>

        {/* List */}
        {isError ? (
          <View className="flex-1 items-center justify-center">
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
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
            onRefresh={refetch}
            refreshing={isLoading}
            ListEmptyComponent={
              !isLoading ? (
                <View className="items-center justify-center pt-8">
                  <Text style={{ color: colors.textSecondary }}>No customers found.</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>

      {/* FAB */}
      <FAB
        icon="plus"
        label="Add Customer"
        color="#ffffff"
        onPress={() => router.push('/(app)/customers/new')}
        style={{ position: 'absolute', bottom: 16, right: 16, backgroundColor: colors.primary }}
      />
    </View>
  );
}
