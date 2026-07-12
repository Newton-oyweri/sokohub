// ProductGrid.tsx
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import Quickorder from '../(tabs)/Cakes/Quickorder';

const PAGE_SIZE = 10;

export default function ProductGrid() {
  const router = useRouter();
  const { category, categoryName } = useLocalSearchParams<{
    category?: string;
    categoryName?: string;
  }>();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (category) {
      // Reset pagination whenever the category changes
      setItems([]);
      setPage(0);
      setHasMore(true);
      fetchItems(category, 0, false);
    }
  }, [category]);

  // NOTE: adjust 'products' to your actual table name if it differs
  const fetchItems = async (categoryId: string, pageToFetch: number, append: boolean) => {
    fetchingRef.current = true;
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const from = pageToFetch * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', categoryId)
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const fetched = data || [];

      setItems(prev => (append ? [...prev, ...fetched] : fetched));
      setHasMore(fetched.length === PAGE_SIZE);
      setPage(pageToFetch);
    } catch (err: any) {
      console.error('Error fetching products:', err.message);
      setError('Could not load items.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  };

  const loadMore = useCallback(() => {
    if (!category || fetchingRef.current || !hasMore) return;
    fetchItems(category, page + 1, true);
  }, [category, hasMore, page]);

  const displayItems = items || [];

  // Helper to get first image from array or fallback
  const getProductImage = (item: any) => {
    if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
      return { uri: item.image_urls[0] };
    }
    if (item.image) {
      return item.image;
    }
  };

  const itemRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < displayItems.length; i += 2) {
      rows.push(displayItems.slice(i, i + 2));
    }
    return rows;
  }, [displayItems]);

  const renderMarketItem = (item: any) => {
    const imageSource = getProductImage(item);
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.itemCard}
        onPress={() => router.push({
          pathname: '../review',
          params: { id: item.id, post_type: item.post_type }
        })}
        activeOpacity={0.9}
      >
        <Image
          source={imageSource}
          style={styles.itemImage}
          resizeMode="cover"
        />

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.itemPrice}>KSh {price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.smallOrderBtn}
            onPress={() => router.push({
              pathname: '../order',
              params: {
                id: item.id,
                name: item.name,
                price: price.toString(),
                seller_id: item.seller_id || '',
                description: item.description || 'Delicious treat',
                image_urls: JSON.stringify(item.image_urls || null),
                post_type: item.post_type,
              }
            })}
          >
            <Text style={styles.smallOrderBtnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="small" color="#6b46c1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptySubtitle}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => category && fetchItems(category, 0, false)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

return (
    <FlatList
      data={itemRows}
      keyExtractor={(_row, rowIndex) => `row-${rowIndex}`}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.4}
      onEndReached={loadMore}
      
      // 1. Inject QuickOrder as the header so it sits cleanly on top of the grid
      ListHeaderComponent={
        <View  style={styles.headerContainer}> 
          <Quickorder/>
        </View>
      }

      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptySubtitle}>Nothing in this category yet</Text>
        </View>
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator size="small" color="#6b46c1" />
          </View>
        ) : null
      }
      renderItem={({ item: row }) => (
        <View style={styles.columnWrapper}>
          {row.map((item: any) => renderMarketItem(item))}
          {row.length === 1 && <View style={styles.spacerCard} />}
        </View>
      )}
    />
  );
}


const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 16, // Optional spacing before the grid items start
  },
  gridContainer: {
    padding: 8,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#6b46c1',
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
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