// CategoryTabs.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

const categories = [
  {
    id: 'cakes',
    label: 'Cakes',
    subtitle: 'Celebrate Sweetly',
    image: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/menucakeimage-min.png',
  },
  {
    id: 'pizza',
    label: 'Pizza',
    subtitle: 'Hot & Delicious',
    image: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/menupizzaimage-min.png',
  },
  {
    id: 'flowers',
    label: 'Flowers',
    subtitle: 'Express Love',
    image: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/menuflowerimage-min.png',
  },
];

type PriceFilter = 'all' | 'under-500' | '500-1000' | 'above-1000';

type CategoryTabsProps = {
  marketItems: any[];
  onFiltersChange: (filteredItems: any[]) => void;
};

export default function CategoryTabs({ marketItems, onFiltersChange }: CategoryTabsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('cakes');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePriceFilter, setActivePriceFilter] = useState<PriceFilter>('all');

  const filteredItems = useMemo(() => {
    let result = marketItems.filter(item => item.category === activeCategory);

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query)
      );
    }

    // Price filter
    switch (activePriceFilter) {
      case 'under-500':
        result = result.filter(item => item.price < 500);
        break;
      case '500-1000':
        result = result.filter(item => item.price >= 500 && item.price <= 1000);
        break;
      case 'above-1000':
        result = result.filter(item => item.price > 1000);
        break;
      default:
        break;
    }

    return result;
  }, [marketItems, activeCategory, searchQuery, activePriceFilter]);

  // Notify parent when filters change
  React.useEffect(() => {
    onFiltersChange(filteredItems);
  }, [filteredItems, onFiltersChange]);

  return (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cakes, pizza, flowers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Three Image Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContainer}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.tabCard,
                isActive && styles.tabCardActive,
              ]}
              onPress={() => setActiveCategory(cat.id)}
              activeOpacity={0.95}
            >
              <Image 
                source={{ uri: cat.image }} 
                style={styles.tabImage} 
                resizeMode="cover"
              />
              
              <View style={[
                styles.tabOverlay,
                isActive && styles.tabOverlayActive
              ]}>
                <Text style={styles.tabLabel}>{cat.label}</Text>
                <Text style={styles.tabSubtitle}>{cat.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Price Filter Chips */}
      <View style={styles.priceFilterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { id: 'all', label: 'All Prices' },
            { id: 'under-500', label: 'Under 500' },
            { id: '500-1000', label: '500 - 1000' },
            { id: 'above-1000', label: 'Above 1000' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.priceChip,
                activePriceFilter === filter.id && styles.priceChipActive,
              ]}
              onPress={() => setActivePriceFilter(filter.id as PriceFilter)}
            >
              <Text style={[
                styles.priceChipText,
                activePriceFilter === filter.id && styles.priceChipTextActive,
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 30,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },

  tabScroll: {
    marginBottom: 16,
  },
  tabContainer: {
    paddingVertical: 8,
    gap: 12,
  },
  tabCard: {
    width: SCREEN_WIDTH * 0.42,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  tabCardActive: {
    transform: [{ scale: 1.03 }],
  },
  tabImage: {
    width: '100%',
    height: '100%',
  },
  tabOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 12,
  },
  tabOverlayActive: {
    backgroundColor: 'rgba(107, 70, 193, 0.35)',
  },
  tabLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  tabSubtitle: {
    fontSize: 13,
    color: '#f1e8ff',
    marginTop: 2,
  },

  priceFilterContainer: {
    marginBottom: 20,
  },
  priceChip: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  priceChipActive: {
    backgroundColor: '#6b46c1',
    borderColor: '#6b46c1',
  },
  priceChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  priceChipTextActive: {
    color: '#fff',
  },
});