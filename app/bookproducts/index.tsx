import { supabase } from '@/lib/supabase';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height: screenHeight } = Dimensions.get('window');

// Updated for full width with minimal padding
const CARD_WIDTH = width * 0.92; // Almost full width
const SPACING = 8; // Reduced spacing
const ITEM_WIDTH = CARD_WIDTH + SPACING;

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_urls: string[] | null;
  seller_id: string;
  post_type: 'sale' | 'booking' | 'pinned';
  rating?: number;
}

export default function WeddingCakesContent() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const [cakes, setCakes] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const fetchingRef = useRef(false);

  useEffect(() => {
    fetchWeddingCakes(0, false);
  }, []);

  const fetchWeddingCakes = async (pageToFetch: number, append: boolean) => {
    fetchingRef.current = true;
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const from = pageToFetch * 6;
      const to = from + 6 - 1;

      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, seller_id, price, image_urls, post_type, rating')
        .eq('category', 'cake')
        .eq('is_available', true)
        .eq('post_type', 'booking')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Supabase Database Error: ', error.message);
        throw error;
      }

      const formattedData = (data || []).map((item) => ({
        ...item,
        rating: item.rating || 0,
      }));

      setCakes(prev => (append ? [...prev, ...formattedData] : formattedData));
      setHasMore(formattedData.length === 6);
      setPage(pageToFetch);
    } catch (error) {
      console.error('Network or Initialization error fetching wedding cakes:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  };

  const loadMore = useCallback(() => {
    if (fetchingRef.current || !hasMore) return;
    fetchWeddingCakes(page + 1, true);
  }, [hasMore, page]);

  const handleHeartPress = async (productId: string, currentRating: number) => {
    if (likedProducts.has(productId)) return;

    const newRating = Math.min(currentRating + 0.1, 10);

    setCakes(prevProducts =>
      prevProducts.map(product =>
        product.id === productId ? { ...product, rating: newRating } : product
      )
    );

    setLikedProducts(prev => new Set(prev).add(productId));

    try {
      const { error } = await supabase
        .from('products')
        .update({ rating: newRating })
        .eq('id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating rating:', error);
      setCakes(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ? { ...product, rating: currentRating } : product
        )
      );
      setLikedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const renderCake = ({ item, index }: { item: Product; index: number }) => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.93, 1.0, 0.93],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.75, 1.0, 0.75],
      extrapolate: 'clamp',
    });

    const imageSource = item.image_urls?.length ? { uri: item.image_urls[0] } : undefined;
    const formattedPrice = `From KSh ${Number(item.price).toLocaleString()}`;
    const isLiked = likedProducts.has(item.id);
    const displayRating = item.rating || 0;

    return (
      <Animated.View style={[styles.cardContainer, { transform: [{ scale }], opacity }]}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.95}
          onPress={() => router.push({
            pathname: '../review',
            params: { id: item.id, post_type: item.post_type }
          })}
        >
          <View style={styles.imageContainer}>
            <Image source={imageSource} style={styles.cakeImage} resizeMode="cover" />
            <View style={styles.imageOverlay} />
            
            <TouchableOpacity
              style={styles.heartBadge}
              onPress={() => handleHeartPress(item.id, displayRating)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? "#ef4444" : "#1e293b"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.details}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            
            <Text style={styles.description} numberOfLines={2}>
              {item.description || 'Custom crafted layout variant designed perfectly for your special timeline.'}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#fbbf24" />
                <Text style={styles.rating}>{displayRating.toFixed(1)} / 10</Text>
              </View>
              <Text style={styles.price}>{formattedPrice}</Text>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => router.push({
                pathname: '../book',
                params: {
                  id: item.id,
                  name: item.name,
                  price: item.price.toString(),
                  image_urls: JSON.stringify(item.image_urls || []),
                  seller_id: item.seller_id,
                }
              })}
            >
              <Text style={styles.bookButtonText}>Secure Date & Book Now</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading && cakes.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6b46c1" />
      </View>
    );
  }

  if (cakes.length === 0) {
    return (
      <View style={[styles.container, styles.center, { paddingHorizontal: 32 }]}>
        <Ionicons name="calendar-outline" size={64} color="#94a3b8" />
        <Text style={styles.emptyTitle}>No custom slots available</Text>
        <Text style={styles.emptySubtitle}>Check back shortly for new catalog updates.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={cakes}
        renderItem={renderCake}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.flatlistContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#6b46c1" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4ff', // Changed from transparent to match header
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  flatlistContent: {
    paddingHorizontal: 8, // Minimal horizontal padding
    alignItems: 'center',
    paddingVertical: 4, // Minimal vertical padding
  },
  cardContainer: {
    width: ITEM_WIDTH,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 4, // Reduced padding
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20, // Slightly reduced
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  imageContainer: {
    width: '100%',
    height: screenHeight * 0.35, // Slightly increased height for better proportion
    position: 'relative',
  },
  cakeImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  heartBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: '#ffffffbf',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    padding: 14, // Slightly reduced padding
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  description: {
    fontSize: 13.5,
    color: '#64748b',
    lineHeight: 19,
    marginBottom: 12,
    height: 38,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14, // Reduced
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10, // Reduced
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginLeft: 4,
  },
  price: {
    fontSize: 18, // Slightly reduced
    fontWeight: '800',
    color: '#6b46c1',
  },
  bookButton: {
    backgroundColor: '#6b46c1',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12, // Reduced
    borderRadius: 12, // Reduced
    gap: 6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14, // Slightly reduced
    fontWeight: '700',
  },
  footerLoading: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
});