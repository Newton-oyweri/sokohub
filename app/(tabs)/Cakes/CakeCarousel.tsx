import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { File, Paths } from 'expo-file-system';
import BookCake from './BookCake';
import Market from './MarketSection';
import SkeletonLoader from './SkeletonLoader';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;
const SPACING = 20;
const ITEM_WIDTH = CARD_WIDTH + SPACING * 2;

// Modern SDK 54+ Object-oriented cache declaration
const cacheFile = new File(Paths.cache, 'pinned_products_cache.json');

interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  price: number;
  image_urls: string[] | null;
  post_type: 'sale' | 'booking' | 'pinned';
}

export default function CakesContent() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  
  const [pinnedProducts, setPinnedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCachedData();
    fetchPinnedProducts();

    // Loop a playful breathing pulse animation for the Quick Order buttons
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const loadCachedData = async () => {
    try {
      if (cacheFile.exists) {
        const cachedContent = await cacheFile.text();
        const parsedData = JSON.parse(cachedContent);
        if (parsedData && parsedData.length > 0) {
          setPinnedProducts(parsedData);
          setLoading(false);
        }
      }
    } catch (err) {
      console.log('Error reading filesystem cache:', err);
    }
  };

  const fetchPinnedProducts = async () => {
    try {
      if (pinnedProducts.length === 0) setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('id, seller_id, name, description, price, image_urls, post_type')
        .eq('is_available', true)
        .eq('post_type', 'pinned')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedData: Product[] = data.map((item) => ({
          id: item.id,
          seller_id: item.seller_id ?? '',
          name: item.name,
          description: item.description ?? null,
          price: item.price ?? 0,
          image_urls: item.image_urls ?? null,
          post_type: item.post_type ?? 'pinned',
        }));
        
        setPinnedProducts(formattedData);
        
        // Modern SDK 54 single line writing
        await cacheFile.write(JSON.stringify(formattedData));
      } else {
        setPinnedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching pinned products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (item: Product) => {
    if (item.image_urls && item.image_urls.length > 0) {
      return { uri: item.image_urls[0] };
    }
    return undefined;
  };

  const renderSkeleton = () => {
    return (
      <View style={styles.skeletonContainer}>
        {[1, 2, 3].map((_, index) => (
          <View key={index} style={[styles.card, styles.skeletonCard]}>
            <View style={styles.imageContainer}>
              <SkeletonLoader style={styles.skeletonImage} />
            </View>
            <View style={styles.details}>
              <View style={styles.headerRow}>
                <SkeletonLoader style={styles.skeletonTitle} />
              </View>
              <SkeletonLoader style={styles.skeletonDescription} />
              <View style={styles.priceRow}>
                <SkeletonLoader style={styles.skeletonPrice} />
                <SkeletonLoader style={styles.skeletonButton} />
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPinnedProduct = ({ item, index }: { item: Product; index: number }) => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.88, 1.04, 0.88],
      extrapolate: 'clamp',
    });

    const imageSource = getProductImage(item);
    const formattedPrice = `KSh ${Number(item.price).toLocaleString()}`;

    return (
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.95}
          onPress={() => router.push({
            pathname: '../review',
            params: { id: item.id, post_type: item.post_type }
          })}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={imageSource} 
              style={styles.cakeImage} 
              resizeMode="cover" 
            />
            <View style={styles.imageOverlay} />
          </View>

          <View style={styles.details}>
            <View style={styles.headerRow}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description || 'No description available.'}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{formattedPrice}</Text>
              
              {/* Animated Wrapper focusing scale exclusively around the button view */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={styles.orderButton}
                  onPress={() => router.push({
                    pathname: '../order',
                    params: { 
                      id: item.id,
                      name: item.name,
                      price: item.price.toString(),
                      seller_id: item.seller_id,
                      description: item.description || 'Delicious treat',
                      image_urls: JSON.stringify(item.image_urls),
                      post_type: item.post_type,
                    }
                  })}
                >
                  <Text style={styles.orderButtonText}>Quick Order</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Specials</Text>
        <Text style={styles.subtitle}>
          Fresh picks, exclusive deals, and customer favorites this week.
        </Text>
      </View>

      {loading ? (
        renderSkeleton()
      ) : pinnedProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="pin-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No Pinned Items</Text>
          <Text style={styles.emptySubtitle}>Check back later for weekly specials!</Text>
        </View>
      ) : (
        <Animated.FlatList
          data={pinnedProducts}
          renderItem={renderPinnedProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={styles.flatlistContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
        />
      )}
      
      <BookCake />
      <Market />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'transparent' 
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 10,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#0f172a' 
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  flatlistContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    paddingVertical: 10,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 28,
    overflow: 'hidden',
    marginHorizontal: SPACING / 2,
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 15,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 235,
  },
  cakeImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(107, 70, 193, 0.12)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  details: { 
    padding: 18 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: { 
    fontSize: 19, 
    fontWeight: '700', 
    color: '#1e293b', 
    flex: 1,
    marginRight: 10,
  },
  description: {
    fontSize: 14.5,
    color: '#64748b',
    lineHeight: 21,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: '#6b46c1',
  },
  orderButton: {
    backgroundColor: '#6b46c1',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 15.5,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  skeletonContainer: {
    flexDirection: 'row',
    paddingHorizontal: (width - CARD_WIDTH) / 2,
    paddingVertical: 10,
    gap: 20,
  },
  skeletonCard: {
    opacity: 0.8,
  },
  skeletonImage: {
    width: '100%',
    height: 235,
    borderRadius: 28,
  },
  skeletonTitle: {
    width: 120,
    height: 20,
    borderRadius: 4,
  },
  skeletonDescription: {
    width: '100%',
    height: 40,
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonPrice: {
    width: 80,
    height: 26,
    borderRadius: 4,
  },
  skeletonButton: {
    width: 100,
    height: 44,
    borderRadius: 16,
  },
});