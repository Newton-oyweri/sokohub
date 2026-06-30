// ProductGrid.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type ProductGridProps = {
  items: any[];
};

export default function ProductGrid({ items }: ProductGridProps) {
  const router = useRouter();

  // Helper to get first image from array or fallback
  const getProductImage = (item: any) => {
    // Check if image_urls exists and is an array with items
    if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
      return { uri: item.image_urls[0] };
    }
    // Fallback to static image if item.image exists (for backwards compatibility)
    if (item.image) {
      return item.image;
    }
    // Default placeholder
    return require('../../../assets/images/town.png');
  };

  const itemRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < items.length; i += 2) {
      rows.push(items.slice(i, i + 2));
    }
    return rows;
  }, [items]);

  const renderMarketItem = (item: any) => {
    const imageSource = getProductImage(item);
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={styles.itemCard}
        onPress={() => router.push(`../review?id=${item.id}`)}
        activeOpacity={0.9}
      >
        <Image 
          source={imageSource} 
          style={styles.itemImage} 
          resizeMode="cover"
          defaultSource={require('../../../assets/images/town.png')}
        />
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemPrice}>KSh {price.toFixed(2)}</Text>
          <TouchableOpacity 
            style={styles.smallOrderBtn}
            onPress={() => router.push({
              pathname: '../order',
              params: { id: item.id }
            })}
          >
            <Text style={styles.smallOrderBtnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.gridContainer}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptySubtitle}>Try changing your search or filters</Text>
        </View>
      ) : (
        itemRows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.columnWrapper}>
            {row.map((item) => renderMarketItem(item))}
            {row.length === 1 && <View style={styles.spacerCard} />}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    paddingBottom: 30,
  },
  columnWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  spacerCard: { width: '48%', backgroundColor: 'transparent' },
  itemImage: { 
    width: '100%', 
    height: 160,
    backgroundColor: '#f1f5f9',
  },
  itemInfo: {
    padding: 12,
    position: 'relative',
    paddingBottom: 52,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6b46c1',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(107, 70, 193, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  smallOrderBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#6b46c1',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },
  smallOrderBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
});