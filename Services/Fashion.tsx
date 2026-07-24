import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

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

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        // Fetch all products that belong to any fashion subcategory
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

  const getProductSize = (index: number) => {
    // Create varied sizes: some large (full width), some regular (half width)
    const pattern = index % 5;
    if (pattern === 0 || pattern === 3) {
      return 'large'; // Full width
    } else {
      return 'regular'; // Half width
    }
  };

  const getProductDimensions = (size: string) => {
    const padding = 8;
    const screenWidth = width - (padding * 2);
    
    switch(size) {
      case 'large':
        return {
          width: screenWidth,
          height: 280,
          marginBottom: 12,
        };
      case 'regular':
      default:
        const regularWidth = (screenWidth - 8) / 2;
        return {
          width: regularWidth,
          height: 240,
          marginBottom: 12,
        };
    }
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => {
    const imageUrl = item.image_urls?.[0];
    const size = getProductSize(index);
    const dimensions = getProductDimensions(size);
    const isLarge = size === 'large';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            width: dimensions.width,
            height: dimensions.height,
            marginBottom: dimensions.marginBottom,
          }
        ]}
        activeOpacity={0.85}
        onPress={() => handleProductPress(item)}
      >
        <Image
          source={imageUrl ? { uri: imageUrl } : require('@/assets/images/icon.png')}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={[styles.cardName, isLarge && styles.cardNameLarge]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.cardPrice, isLarge && styles.cardPriceLarge]}>
            {formatKES(item.price)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderProductGrid = () => {
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

    if (products.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No items found in this category.</Text>
        </View>
      );
    }

    return (
      <View style={styles.gridContainer}>
        {products.map((item, index) => (
          <View key={item.id} style={styles.gridItem}>
            {renderProductItem({ item, index })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
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

      {/* Products Grid */}
      {renderProductGrid()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    paddingBottom: 60,
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
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
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
  gridContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    // No extra styles - just container for the card
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardImage: {
    width: '100%',
    height: '75%',
    backgroundColor: '#F3F4F6',
  },
  cardContent: {
    padding: 10,
    height: '25%',
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardNameLarge: {
    fontSize: 14,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b46c1',
  },
  cardPriceLarge: {
    fontSize: 16,
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
