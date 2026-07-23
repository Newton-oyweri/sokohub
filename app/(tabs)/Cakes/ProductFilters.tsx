import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ProductFiltersProps = {
  onPriceFilterChange: (range: string | null) => void;
  selectedPriceRange: string | null;
  onSubcategoryChange: (categoryId: string | null) => void;
  subcategories: { id: string; name: string }[];
  selectedSubcategory: string | null;
};

const PRICE_RANGES = [
  { id: 'all', label: 'All', min: null, max: null },
  { id: 'below1000', label: 'Below 1000', min: 0, max: 1000 },
  { id: '1000-2000', label: '1000 - 2000', min: 1000, max: 2000 },
  { id: '2000-3000', label: '2000 - 3000', min: 2000, max: 3000 },
  { id: 'above3000', label: 'Above 3000', min: 3000, max: null },
];

export default function ProductFilters({
  onPriceFilterChange,
  selectedPriceRange,
  onSubcategoryChange,
  subcategories,
  selectedSubcategory,
}: ProductFiltersProps) {
  return (
    <View style={styles.container}>
      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedSubcategory && styles.filterChipActive,
          ]}
          onPress={() => onSubcategoryChange(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              !selectedSubcategory && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        {subcategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterChip,
              selectedSubcategory === category.id && styles.filterChipActive,
            ]}
            onPress={() => onSubcategoryChange(category.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedSubcategory === category.id && styles.filterChipTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Price Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {PRICE_RANGES.map((range) => (
          <TouchableOpacity
            key={range.id}
            style={[
              styles.filterChip,
              styles.priceChip,
              selectedPriceRange === range.id && styles.filterChipActive,
            ]}
            onPress={() => onPriceFilterChange(range.id)}
          >
            <Ionicons 
              name="cash-outline" 
              size={14} 
              color={selectedPriceRange === range.id ? '#fff' : '#64748b'} 
            />
            <Text
              style={[
                styles.filterChipText,
                selectedPriceRange === range.id && styles.filterChipTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    marginTop: 4,
    gap: 8,
  },
  filterScroll: {
    maxHeight: 44,
  },
  filterContainer: {
    paddingHorizontal: 8,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#6b46c1',
    borderColor: '#6b46c1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  priceChip: {
    gap: 4,
  },
});
