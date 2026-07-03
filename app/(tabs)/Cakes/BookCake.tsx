import { supabase } from '@/lib/supabase';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  rating?: number; 
}

export default function WeddingCakesContent() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  
  const [cakes, setCakes] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWeddingCakes();
  }, []);

  const fetchWeddingCakes = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image_urls, post_type, rating')
        .eq('category', 'cake')
        .eq('is_available', true)
        .eq('post_type', 'booking')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Database Error: ", error.message);
        throw error;
      }

      if (data && data.length > 0) {
        const formattedData = data.map((item) => ({
          ...item,
          rating: item.rating || 0,
        }));
        setCakes(formattedData);
      } else {
        console.warn("No booking cakes found.");
      }
    } catch (error) {
      console.error('Network or Initialization error fetching wedding cakes:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Handle heart tap - increment rating by 0.1
  const handleHeartPress = async (productId: string, currentRating: number) => {
    // Prevent multiple taps
    if (likedProducts.has(productId)) {
      return;
    }

    const newRating = Math.min(currentRating + 0.1, 10);

    // Update UI immediately (optimistic update)
    setCakes(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, rating: newRating }
          : product
      )
    );

    // Mark as liked
    setLikedProducts(prev => new Set(prev).add(productId));

    // Update in Supabase
    try {
      const { error } = await supabase
        .from('products')
        .update({ rating: newRating })
        .eq('id', productId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating rating:', error);
      // Revert if error
      setCakes(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, rating: currentRating }
            : product
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
      outputRange: [0.88, 1.04, 0.88],
      extrapolate: 'clamp',
    });

    const imageSource =
      item.image_urls?.length
        ? { uri: item.image_urls[0] }
        : undefined;

    const formattedPrice = `From KSh ${Number(item.price).toLocaleString()}`;
    const isLiked = likedProducts.has(item.id);
    const displayRating = item.rating || 0;

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
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

              <TouchableOpacity 
                onPress={() => handleHeartPress(item.id, displayRating)}
                activeOpacity={0.7}
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
                <Ionicons
                  name="star"
                  size={18}
                  color="#fbbf24"
                />
                <Text style={styles.rating}>{displayRating.toFixed(1)} / 10</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{formattedPrice}</Text>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => router.push({
                  pathname: '../book',
                  params: { id: item.id }
                })}
              >
                <Text style={styles.bookButtonText}>
                  Book Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', minHeight: 300 }]}>
        <ActivityIndicator size="large" color="#6b46c1" />
      </View>
    );
  }

  if (cakes.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ color: '#64748b', fontSize: 16, textAlign: 'center' }}>
          No booking cakes available at the moment.
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 14, marginTop: 8 }}>
          Check back later for custom cake bookings! 🎂
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
  <View style={styles.header}>
  <Text style={styles.title}>Occasion Designs</Text>
  <Text style={styles.subtitle}>
    We've got you covered for birthdays, weddings, graduations & every celebration.
  </Text>
</View>

      <Animated.FlatList
        data={cakes}
        renderItem={renderCake}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff00',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
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
    width: '100%',
    height: 235,
    position: 'relative',
  },
  cakeImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(107,70,193,0.12)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(107, 70, 193, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
    padding: 18,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 5,
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6b46c1',
  },
  bookButton: {
    backgroundColor: '#6b46c1',
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 15.5,
    fontWeight: '700',
  },
});