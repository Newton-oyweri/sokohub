import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

export default function Fashion() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const toggleSidebar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSidebarOpen((prev) => !prev);
  };

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

      let query = supabase
        .from('products')
        .select('id, name, price, image_urls, category, rating')
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

      setProducts(data || []);
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
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

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
          <Text style={styles.cardName} numberOfLines={2}>
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
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.heading}>Fashion & Apparel</Text>
          <Text style={styles.subheading}>Explore clothing, shoes, and accessories</Text>
        </View>
      </View>

      {/* Main Content Area - no flex:1, sizes to its natural content height
          since this whole component now lives inside the home screen's
          outer Animated.ScrollView, not its own full-height container. */}
      <View style={styles.body}>
        {/* Left Sidebar - plain View, not a ScrollView. The category list is
            short enough to render inline; the outer screen scroll carries it. */}
        <View style={[styles.sidebar, !isSidebarOpen && styles.sidebarCollapsed]}>
          <TouchableOpacity
            style={styles.sidebarToggle}
            activeOpacity={0.7}
            onPress={toggleSidebar}
          >
            <Ionicons
              name={isSidebarOpen ? 'chevron-back' : 'chevron-forward'}
              size={18}
              color="#6b46c1"
            />
            {isSidebarOpen && <Text style={styles.toggleText}>Categories</Text>}
          </TouchableOpacity>

          {/* All Items Option */}
          <TouchableOpacity
            style={[
              styles.categoryTab,
              selectedCategory === 'all' && styles.activeCategoryTab,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Ionicons
              name="grid-outline"
              size={16}
              color={selectedCategory === 'all' ? '#6b46c1' : '#6B7280'}
            />
            {isSidebarOpen && (
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === 'all' && styles.activeCategoryText,
                ]}
                numberOfLines={1}
              >
                All Items
              </Text>
            )}
          </TouchableOpacity>

          {/* Subcategory List */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryTab, isSelected && styles.activeCategoryTab]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={16}
                  color={isSelected ? '#6b46c1' : '#6B7280'}
                />
                {isSidebarOpen && (
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.activeCategoryText,
                    ]}
                    numberOfLines={2}
                  >
                    {cat.name}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Side - Product Content */}
        <View style={styles.content}>
          {loading ? (
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
              <Text style={styles.emptyText}>No items found in this category.</Text>
            </View>
          ) : (
            // scrollEnabled=false: this FlatList no longer owns its own scroll.
            // It just lays out the grid and reports its natural height; the
            // home screen's outer Animated.ScrollView is the single scroller.
          // In your component, modify the FlatList
<FlatList
  data={products}
  keyExtractor={(item) => item.id}
  renderItem={renderProductItem}
  numColumns={2}
  scrollEnabled={Platform.OS === 'web' ? true : false}  // ← Enable on web
  columnWrapperStyle={styles.columnWrapper}
  contentContainerStyle={styles.listContent}
  showsVerticalScrollIndicator={true}
/>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    paddingBottom:56,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleContainer: {
    justifyContent: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  subheading: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  /* Left Sidebar Styling */
  sidebar: {
    width: '32%',
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  sidebarCollapsed: {
    width: 52,
  },
  sidebarToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#EEF2FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 4,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b46c1',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  activeCategoryTab: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: '#6b46c1',
  },
  categoryText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#6b46c1',
    fontWeight: '700',
  },
  /* Right Side Content Styling */
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6b46c1',
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  listContent: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 110,
    backgroundColor: '#F3F4F6',
  },
  cardContent: {
    padding: 8,
  },
  cardName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    minHeight: 32,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b46c1',
    marginTop: 4,
  },
});

