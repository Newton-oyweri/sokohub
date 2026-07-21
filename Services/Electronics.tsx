import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  image_urls: string[] | null;
  category: string;
  rating: number;
};

function formatKES(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

export default function Electronics() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Electronics Subcategories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('product_category_id', 'electronics')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching electronics categories:', err.message);
    }
  };

  // Fetch Products based on selected category filter
  const fetchProducts = useCallback(async () => {
    try {
      setError(null);

      let query = supabase
        .from('products')
        .select('id, name, price, image_urls, category, rating')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      } else {
        // Fetch products belonging to any electronics subcategory
        const { data: electronicsCats } = await supabase
          .from('categories')
          .select('id')
          .eq('product_category_id', 'electronics');

        if (electronicsCats && electronicsCats.length > 0) {
          const categoryIds = electronicsCats.map((c) => c.id);
          query = query.in('category', categoryIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching electronics products:', err.message);
      setError('Could not load electronics. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = (productId: string) => {
    router.push({
      pathname: '../products/[id]',
      params: { id: productId },
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const imageUrl = item.image_urls?.[0];

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => handleProductPress(item.id)}
      >
        <Image
          source={imageUrl ? { uri: imageUrl } : require('@/assets/images/icon.png')}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardPrice}>{formatKES(item.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.heading}>Electronics & Tech</Text>
      <Text style={styles.subheading}>Smartphones, laptops, appliances, and accessories</Text>

      {/* Horizontal Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        <TouchableOpacity
          style={[styles.pill, selectedCategory === 'all' && styles.activePill]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.pillText, selectedCategory === 'all' && styles.activePillText]}>
            All
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected && styles.activePill]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.pillText, isSelected && styles.activePillText]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Content Area */}
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6b46c1" />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchProducts} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No electronics available in this category yet.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6b46c1']} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    paddingHorizontal: 20,
  },
  subheading: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  activePill: {
    backgroundColor: '#6b46c1',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#6b46c1',
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  cardContent: {
    padding: 12,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b46c1',
    marginTop: 4,
  },
});

