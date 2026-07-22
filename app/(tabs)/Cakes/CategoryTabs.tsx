import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import Quickorder from './Quickorder';

type Product = {
  id: string;
  name: string;
  price: number | string;
  description?: string;
  image_urls?: string[] | null;
  image?: string;
  seller_id?: string;
  post_type?: string;
};

// Fixed height variants matching your original masonry look
const HEIGHT_VARIANTS = [280, 220, 250, 200, 260];

const PAGE_SIZE = 12;

export default function CategoryTabs() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [bookingImageUrl, setBookingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchingRef = useRef(false);
  const isNavigating = useRef(false);

  useEffect(() => {
    initialLoad();
  }, []);

  const fetchCakeCategoryIds = async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('product_category_id', 'cake-bakery')
      .eq('is_active', true);

    if (error) throw error;
    return (data || []).map((cat) => cat.id);
  };

  const fetchProducts = async (pageToFetch: number, append: boolean) => {
    fetchingRef.current = true;
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const categoryIds = await fetchCakeCategoryIds();

      if (categoryIds.length === 0) {
        setProducts([]);
        setHasMore(false);
        return;
      }

      const from = pageToFetch * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .in('category', categoryIds)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (prodErr) throw prodErr;

      const fetched = data || [];
      setProducts((prev) => (append ? [...prev, ...fetched] : fetched));
      setHasMore(fetched.length === PAGE_SIZE);
      setPage(pageToFetch);
    } catch (err: any) {
      console.error('Error fetching bakery products:', err.message);
      setError('Could not load products. Check your connection!');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  };

  const fetchBookingBanner = async () => {
    try {
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('post_type', 'booking')
        .eq('is_available', true)
        .not('image_urls', 'is', null);

      const totalCount = count || 0;
      if (totalCount > 0) {
        const randomOffset = Math.floor(Math.random() * totalCount);
        const { data } = await supabase
          .from('products')
          .select('image_urls')
          .eq('post_type', 'booking')
          .eq('is_available', true)
          .not('image_urls', 'is', null)
          .range(randomOffset, randomOffset)
          .single();

        if (data?.image_urls && Array.isArray(data.image_urls) && data.image_urls.length > 0) {
          setBookingImageUrl(data.image_urls[0]);
        }
      }
    } catch (err) {
      console.warn('Booking banner fetch issue:', err);
    }
  };

  const initialLoad = async () => {
    fetchBookingBanner();
    await fetchProducts(0, false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    fetchBookingBanner();
    await fetchProducts(0, false);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (fetchingRef.current || !hasMore || loading) return;
    fetchProducts(page + 1, true);
  };

  const handleBookingPress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.push({ pathname: '../bookproducts' });
    setTimeout(() => {
      isNavigating.current = false;
    }, 500);
  };

  const getProductImage = (item: Product) => {
    if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
      return { uri: item.image_urls[0] };
    }
    if (item.image) {
      return typeof item.image === 'string' ? { uri: item.image } : item.image;
    }
    return undefined;
  };

  const renderProductCard = (item: Product, height: number) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const imageSource = getProductImage(item);

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.tabCard, { height }]}
        onPress={() =>
          router.push({
            pathname: '../review',
            params: { id: item.id, post_type: item.post_type },
          })
        }
        activeOpacity={0.95}
      >
        <Image source={imageSource} style={styles.tabImage} resizeMode="cover" />
        <View style={styles.tabOverlay}>
          <Text style={styles.tabLabel} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.tabPrice}>KSh {price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = useCallback(() => {
    if (loading && !refreshing) {
      return (
        <View style={styles.masonryContainer}>
          <View style={styles.masonryColumn}>
            {[0, 2, 4].map((i) => (
              <View key={`left-skel-${i}`} style={[styles.skeletonCard, { height: HEIGHT_VARIANTS[i % HEIGHT_VARIANTS.length] }]} />
            ))}
          </View>
          <View style={styles.masonryColumn}>
            <View style={[styles.skeletonCard, { height: 420 }]} />
            {[0, 2].map((i) => (
              <View key={`right-skel-${i}`} style={[styles.skeletonCard, { height: HEIGHT_VARIANTS[(i + 2) % HEIGHT_VARIANTS.length] }]} />
            ))}
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={initialLoad} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (products.length === 0) {
      return (
        <View style={styles.centerState}>
          <Ionicons name="fast-food-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No items available</Text>
          <Text style={styles.emptySubtitle}>Check back soon for freshly baked goods!</Text>
        </View>
      );
    }

    return (
      <View style={styles.masonryContainer}>
        {/* Left Column: Even-indexed Products */}
        <View style={styles.masonryColumn}>
          {products
            .filter((_, i) => i % 2 === 0)
            .map((item, i) => {
              const height = HEIGHT_VARIANTS[i % HEIGHT_VARIANTS.length];
              return renderProductCard(item, height);
            })}
        </View>

        {/* Right Column: Event Booking CTA + Odd-indexed Products */}
        <View style={styles.masonryColumn}>
          {/* Main Large Booking Block Card directly in original right-column spot */}
          <TouchableOpacity
            style={[styles.tabCard, styles.bookingCard]}
            onPress={handleBookingPress}
            activeOpacity={0.92}
          >
            {bookingImageUrl && (
              <>
                <Image
                  source={{ uri: bookingImageUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                <View style={styles.bookingImageOverlay} />
              </>
            )}
            <View style={styles.bookingCardContent}>
              <Text style={styles.bookingQuestion}>Got an event?</Text>
              <Text style={styles.bookingAction}>Book now!</Text>
            </View>
          </TouchableOpacity>

          {products
            .filter((_, i) => i % 2 === 1)
            .map((item, i) => {
              const height = HEIGHT_VARIANTS[(i + 2) % HEIGHT_VARIANTS.length];
              return renderProductCard(item, height);
            })}
        </View>
      </View>
    );
  }, [products, bookingImageUrl, loading, error, refreshing]);

  return (
    <FlatList
      data={[{ key: 'products-masonry' }]}
      renderItem={() => renderContent()}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.4}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6b46c1']} />
      }
      ListHeaderComponent={
        /* Fixed, stable Quickorder container wrapper prevents layout shifting */
        <View style={styles.quickOrderWrapper}>
          <Quickorder />
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator size="small" color="#6b46c1" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 8,
    paddingBottom: 50,
  },
  quickOrderWrapper: {
    marginBottom: 12,
    minHeight: 60, // Reserves height so component doesn't bounce/dance on render
    width: '100%',
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  masonryColumn: {
    width: '48.5%',
    gap: 12,
  },
  skeletonCard: {
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
  },
  tabCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  bookingCard: {
    height: 420, // Maintained original 420 height
    backgroundColor: '#6b46c1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bookingImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(107, 70, 193, 0.45)',
  },
  bookingCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  bookingQuestion: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bookingAction: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 6,
  },
  tabImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f1f5f9',
  },
  tabOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    padding: 10,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  tabPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#f1e8ff',
    marginTop: 2,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6b46c1',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

