import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 0;
const RECENT_SEARCHES_KEY = '@sokohub_recent_searches';

export type Product = {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  price: number;
  image_urls: string[] | null;
  category: string;
  product_category_id: string | null;
  rating: number;
  post_type: 'sale' | 'booking' | 'pinned';
};

function formatKES(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

const CATEGORIES = [
  { id: 'bakery', label: 'Cakes & Bakery', icon: 'cafe-outline' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt-outline' },
  { id: 'electronics', label: 'Electronics', icon: 'hardware-chip-outline' },
];

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load stored recent searches from AsyncStorage on mount
  useEffect(() => {
    loadRecentSearches();

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load recent searches:', err);
    }
  };

  const saveRecentSearch = async (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    try {
      const updated = [cleanTerm, ...recentSearches.filter((item) => item !== cleanTerm)].slice(0, 5);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save recent search:', err);
    }
  };

  const clearAllRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.error('Failed to clear recent searches:', err);
    }
  };

  const handleRemoveRecent = async (term: string) => {
    try {
      const updated = recentSearches.filter((item) => item !== term);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to remove recent search:', err);
    }
  };

  // Debounced multi-field search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults(searchQuery.trim());
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSearchResults = async (queryText: string) => {
    try {
      setLoading(true);

      const sanitized = queryText.replace(/[%_]/g, '\\$&');

      const { data, error } = await supabase
        .from('products')
        .select(
          'id, seller_id, name, description, price, image_urls, category, product_category_id, rating, post_type'
        )
        .or(`name.ilike.%${sanitized}%,description.ilike.%${sanitized}%`)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      setResults((data as Product[]) || []);
    } catch (err: any) {
      console.error('Error fetching search results:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuery = (text: string) => {
    setSearchQuery(text);
  };

  const handleClearQuery = () => {
    setSearchQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const handleProductPress = (item: Product) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }

    router.push({
      pathname: '/order',
      params: {
        id: item.id,
        name: item.name,
        price: item.price.toString(),
        seller_id: item.seller_id,
        description: item.description || '',
        image_urls: JSON.stringify(item.image_urls || []),
        category: item.category,
        product_category_id: item.product_category_id || '',
        rating: item.rating.toString(),
        post_type: item.post_type,
      },
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const imageUrl = item.image_urls?.[0];

    return (
      <TouchableOpacity
        style={styles.resultCard}
        activeOpacity={0.8}
        onPress={() => handleProductPress(item)}
      >
        <Image
          source={imageUrl ? { uri: imageUrl } : require('@/assets/images/icon.png')}
          style={styles.resultImage}
          resizeMode="cover"
        />
        <View style={styles.resultInfo}>
          <Text style={styles.resultName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.resultDescription} numberOfLines={1}>
            {item.description || 'No description available'}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.resultPrice}>{formatKES(item.price)}</Text>
            {item.rating > 0 && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: STATUS_BAR_HEIGHT }]}>
      {/* Header & Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Ionicons name="search-outline" size={20} color="#6B46C1" />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, brand, or details..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={() => saveRecentSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearQuery}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content Area */}
      {searchQuery.trim().length > 0 ? (
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="large" color="#6B46C1" />
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={renderProductItem}
              contentContainerStyle={styles.listPadding}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>
                We couldn't find anything matching "{searchQuery}". Try checking for typos or broader keywords.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Real Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearAllRecentSearches}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.chipsRow}>
                {recentSearches.map((term, idx) => (
                  <View key={idx} style={styles.recentChip}>
                    <TouchableOpacity onPress={() => handleSelectQuery(term)}>
                      <Text style={styles.recentText}>{term}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemoveRecent(term)}>
                      <Ionicons name="close" size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Clean Popular Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryCard}
                  onPress={() => handleSelectQuery(cat.label)}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name={cat.icon as any} size={22} color="#6B46C1" />
                  </View>
                  <Text style={styles.categoryText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent', // Prevents border appearance changes
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
    borderWidth: 0,
    // Removes active default focus rings on Web & Android
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  } as any,
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B46C1',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  recentText: {
    fontSize: 13,
    color: '#4B5563',
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 12,
  },
  categoryCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F4FF',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingWrapper: {
    paddingTop: 40,
    alignItems: 'center',
  },
  listPadding: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B46C1',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});

