import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Market from './MarketSection';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;        // Slightly wider for better look
const SPACING = 20;
const ITEM_WIDTH = CARD_WIDTH + SPACING * 2;

const featuredCakes = [
  {
    id: '1',
    name: 'Wonderland Special',
    price: 'KSh 500',
    image: require('../../../assets/images/cake.png'),
    description: 'Rich vanilla cake with rainbow layers and creamy frosting...',
    rating: 4.8,
    sold: '2.4k',
  },
  {
    id: '2',
    name: 'Chocolate Dream',
    price: 'KSh 450',
    image: require('../../../assets/images/town.png'),
    description: 'Decadent Belgian chocolate with ganache and chocolate shards...',
    rating: 4.9,
    sold: '1.8k',
  },
  {
    id: '3',
    name: 'Strawberry Bliss',
    price: 'KSh 550',
    image: require('../../../assets/images/moist.png'),
    description: 'Fresh strawberries, light sponge and vanilla cream...',
    rating: 4.7,
    sold: '3.1k',
  },
    {
    id: '4',
    name: 'fres pizza',
    price: 'KSh 950',
    image: require('../../../assets/images/pizza.png'),
    description: 'Fresh strawberries, light sponge and vanilla cream...',
    rating: 4.7,
    sold: '3.1k',
  },
];

export default function CakesContent() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const renderFeaturedCake = ({ item, index }: any) => {
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

    return (
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.95}
          onPress={() => router.push(`../review`)}
        >
          {/* Image with Glow Overlay */}
          <View style={styles.imageContainer}>
            <Image 
              source={item.image} 
              style={styles.cakeImage} 
              resizeMode="cover" 
            />
            <View style={styles.imageOverlay} />
          </View>

          <View style={styles.details}>
            <View style={styles.headerRow}>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <TouchableOpacity>
                <Ionicons name="heart-outline" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={18} color="#fbbf24" />
                <Text style={styles.rating}>{item.rating}</Text>
              </View>
              <Text style={styles.sold}>{item.sold} sold</Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{item.price}</Text>
              <TouchableOpacity
                style={styles.orderButton}
                onPress={() => router.push('../order')}
              >
                <Text style={styles.orderButtonText}>Quick Order</Text>
              </TouchableOpacity>
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
      </View>

      <Animated.FlatList
        data={featuredCakes}
        renderItem={renderFeaturedCake}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 10,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#0f172a' 
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

    // Beautiful Glow Effect
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
    backgroundColor: 'rgba(107, 70, 193, 0.12)', // Soft purple tint
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

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  rating: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1e293b' 
  },
  sold: { 
    fontSize: 13.5, 
    color: '#64748b' 
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
});