import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import Market from './MarketSection';
import BookCake from './BookCake';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;
const SPACING = 20;
const ITEM_WIDTH = CARD_WIDTH + SPACING * 2;

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_urls: string[] | null;
  post_type: 'sale' | 'booking' | 'pinned';
  rating: number; // Changed to required number with default 0
  sold?: string;
}

export default function CakesContent() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  
  const [pinnedProducts, setPinnedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPinnedProducts();
  }, []);

  const fetchPinnedProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_urls, post_type, rating')
        .eq('is_available', true)
        .eq('post_type', 'pinned')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Database Error: ", error.message);
        throw error;
      }

      if (data && data.length > 0) {
        const formattedData = data.map((item) => ({
          ...item,
          rating: item.rating || 0, // Use actual rating from DB, default 0
          sold: `${Math.floor(Math.random() * 5) + 1}k`,
        }));
        setPinnedProducts(formattedData);
      } else {
        console.warn("No pinned products found.");
        setPinnedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching pinned products:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Function to increment rating when liked
  const handleLike = async (productId: string, currentRating: number) => {
    // Prevent spam clicking
    if (likedProducts.has(productId)) {
      Alert.alert('Already Liked!', 'You already liked this product ❤️');
      return;
    }

    try {
      // Calculate new rating (cap at 10)
      const newRating = Math.min(currentRating + 0.1, 10);

      // Update in Supabase
      const { error } = await supabase
        .from('products')
        .update({ rating: newRating })
        .eq('id', productId);

      if (error) throw error;

      // Update local state
      setPinnedProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, rating: newRating }
            : product
        )
      );

      // Mark as liked
      setLikedProducts(prev => new Set(prev).add(productId));

      // Show feedback (optional)
      Alert.alert('❤️ Loved!', `Rating increased to ${newRating.toFixed(1)}`);

    } catch (error) {
      console.error('Error updating rating:', error);
      Alert.alert('Error', 'Failed to update rating. Please try again.');
    }
  };

  const getProductImage = (item: Product) => {
    if (item.image_urls && item.image_urls.length > 0) {
      return { uri: item.image_urls[0] };
    }
    return require('../../../assets/images/cake.png');
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
    const isLiked = likedProducts.has(item.id);
    const displayRating = item.rating || 0;

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
            
            {/* 🔥 Pinned Badge */}
            <View style={styles.badgeContainer}>
              <Ionicons name="pin" size={14} color="#fff" />
              <Text style={styles.badgeText}>PINNED</Text>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.headerRow}>
              <Text style={styles.productName} numberOfLines={1}>
                {item.name}
              </Text>
              
              {/* ❤️ Heart Button with Rating */}
              <TouchableOpacity 
                onPress={() => handleLike(item.id, displayRating)}
                activeOpacity={0.7}
                style={styles.heartButton}
              >
                <Ionicons 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isLiked ? "#ef4444" : "#64748b"} 
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description || 'No description available.'}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={18} color="#fbbf24" />
                <Text style={styles.rating}>{displayRating.toFixed(1)}</Text>
                <Text style={styles.ratingLabel}>/ 10</Text>
              </View>
              <Text style={styles.engagementText}>
                {Math.round(displayRating * 10)} engagements
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{formattedPrice}</Text>
              <TouchableOpacity
                style={styles.orderButton}
                onPress={() => router.push({
                  pathname: '../order',
                  params: { id: item.id }
                })}
              >
                <Text style={styles.orderButtonText}>Quick Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', minHeight: 300 }]}>
        <ActivityIndicator size="large" color="#6b46c1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Weekly Specials</Text>
        <Text style={styles.subtitle}>❤️ Like to boost ratings!</Text>
      </View>

      {pinnedProducts.length === 0 ? (
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
    backgroundColor: '#ffffff00' 
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
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  heartButton: {
    padding: 4,
  },
  description: {
    fontSize: 14.5,
    color: '#64748b',
    lineHeight: 21,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1e293b' 
  },
  ratingLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  engagementText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});