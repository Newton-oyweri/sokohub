// ProductDisplay.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

interface ProductDisplayProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image_urls: string[] | null;
    post_type?: string;
  };
}

export default function ProductDisplay({ product }: ProductDisplayProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Get image array or fallback
  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : ['https://via.placeholder.com/400x300/6b46c1/ffffff?text=No+Image'];

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const renderImage = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageSlide}>
      <Image 
        source={{ uri: item }} 
        style={styles.cakeImage} 
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Image Carousel */}
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderImage}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        {/* Dot Indicators */}
        {images.length > 1 && (
          <View style={styles.dotContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeIndex === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {activeIndex + 1} / {images.length}
            </Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.detailsContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productDescription}>
          {product.description || 'No description available.'}
        </Text>
        <Text style={styles.productPrice}>KSh {Number(product.price).toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  carouselContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
  },
  imageSlide: {
    width: width - 40, // Account for padding
    height: 280,
    position: 'relative',
  },
  cakeImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pinnedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
  },
  bookingBadge: {
    backgroundColor: 'rgba(107, 70, 193, 0.9)',
  },
  saleBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dotContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    backgroundColor: '#6b46c1',
    width: 20,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 18,
  },
  productName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6b46c1',
  },
});