import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  price: number;
  image_urls: string[] | null;
  category: string;
  rating: number;
  post_type: 'sale' | 'booking' | 'pinned';
};

function formatKES(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

export default function Fashion() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Responsive Grid Calculations
  const GRID_PADDING = 12;
  const GAP = 12;

  // 2 columns for phones, 3 for small tablets (≥600px), 4 for large screens (≥900px)
  const numColumns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const cardWidth = (width - GRID_PADDING * 2 - GAP * (numColumns - 1)) / numColumns;

  // Fetch Fashion Subcategories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .eq('product_category_id', 'fashion')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching fashion categories:', err.message);
    }
  };

  // Fetch Products based on selected filter
  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      let query = supabase
        .from('products')
        .select('id, seller_id, name, description, price, image_urls, category, rating, post_type')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      } else {
        const { data: fashionCats } = await supabase
          .from('categories')
          .select('id')
          .eq('product_category_id', 'fashion');

        if (fashionCats && fashionCats.length > 0) {
          const categoryIds = fashionCats.map((c) => c.id);
          query = query.in('category', categoryIds);
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedData: Product[] = (data || []).map((item) => ({
        id: item.id,
        seller_id: item.seller_id ?? '',
        name: item.name,
        description: item.description ?? null,
        price: item.price ?? 0,
        image_urls: item.image_urls ?? null,
        category: item.category ?? '',
        rating: item.rating ?? 0,
        post_type: item.post_type ?? 'sale',
      }));

      setProducts(formattedData);
    } catch (err: any) {
      console.error('Error fetching fashion products:', err.message);
      setError('Could not load products. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = (item: Product) => {
    router.push({
      pathname: '../order',
      params: {
        id: item.id,
        name: item.name,
        price: item.price.toString(),
        seller_id: item.seller_id,
        description: item.description || 'Quality fashion item',
        image_urls: JSON.stringify(item.image_urls),
        post_type: item.post_type,
      },
    });
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const imageUrl = item.image_urls?.[0];

    return (
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }]}
        activeOpacity={0.85}
        onPress={() => handleProductPress(item)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={imageUrl ? { uri: imageUrl } : require('@/assets/images/icon.png')}
            style={styles.cardImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.cardPrice}>
            {formatKES(item.price)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Fashion & Apparel</Text>
        <Text style={styles.subheading}>Explore clothing, shoes, and accessories</Text>
      </View>

      {/* Categories - Horizontal Scroll */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === 'all' && styles.activeCategoryChip,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === 'all' && styles.activeCategoryChipText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  isSelected && styles.activeCategoryChip,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.activeCategoryChipText,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6b46c1" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchProducts} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No items found in this category.</Text>
      </View>
    );
  };

  return (
    <FlatList
      key={`grid-${numColumns}`}
      data={loading || error ? [] : products}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      renderItem={renderProductItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={styles.contentContainer}
      columnWrapperStyle={
        products.length > 0
          ? { gap: GAP, marginBottom: GAP, paddingHorizontal: GRID_PADDING }
          : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 60,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  subheading: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  categoriesWrapper: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 12,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#6b46c1',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8F9FA',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 10,
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 18,
    minHeight: 36,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6b46c1',
    marginTop: 4,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#6b46c1',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

