import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import Quickorder from './Quickorder';
import ProductFilters from './ProductFilters';

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

type Category = {
  id: string;
  name: string;
  subtitle?: string;
  image_url?: string;
};

const getHeightVariants = (width: number) => {
  const isLargeScreen = width > 600;
  const isTablet = width > 900;

  if (isTablet) return [340, 280, 310, 260, 320];
  if (isLargeScreen) return [300, 240, 270, 220, 290];
  return [280, 220, 250, 200, 260];
};

const PAGE_SIZE = 12;

// Price range mapping
const PRICE_RANGES = {
  'all': { min: null, max: null },
  'below1000': { min: 0, max: 1000 },
  '1000-2000': { min: 1000, max: 2000 },
  '2000-3000': { min: 2000, max: 3000 },
  'above3000': { min: 3000, max: null },
};

export default function CategoryTabs() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [bookingImageUrl, setBookingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const [numColumns, setNumColumns] = useState(2);

  // Filter states
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [allCategoryIds, setAllCategoryIds] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>('all');

  const fetchingRef = useRef(false);
  const isNavigating = useRef(false);

  useEffect(() => {
    initialLoad();

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
      updateNumColumns(window.width);
    });

    return () => subscription?.remove();
  }, []);

  const updateNumColumns = (width: number) => {
    if (width > 1024) {
      setNumColumns(4);
    } else if (width > 768) {
      setNumColumns(3);
    } else {
      setNumColumns(2);
    }
  };

  const fetchCakeCategoryIds = async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .eq('product_category_id', 'cake-bakery')
      .eq('is_active', true);

    if (error) throw error;
    const ids = (data || []).map((cat) => cat.id);
    setAllCategoryIds(ids);
    return ids;
  };

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, subtitle, image_url')
        .eq('product_category_id', 'cake-bakery')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSubcategories(data || []);
    } catch (err) {
      console.warn('Error fetching subcategories:', err);
    }
  };

  const fetchProducts = async (
    pageToFetch: number,
    append: boolean,
    overrideSubcategory: string | null = selectedSubcategory,
    overridePriceRange: string | null = selectedPriceRange
  ) => {
    fetchingRef.current = true;
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let categoryIds = allCategoryIds;

      if (categoryIds.length === 0) {
        categoryIds = await fetchCakeCategoryIds();
      }

      let targetCategoryIds = categoryIds;
      if (overrideSubcategory && categoryIds.includes(overrideSubcategory)) {
        targetCategoryIds = [overrideSubcategory];
      }

      if (targetCategoryIds.length === 0) {
        setProducts([]);
        setHasMore(false);
        return;
      }

      const from = pageToFetch * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('products')
        .select('*')
        .in('category', targetCategoryIds)
        .eq('is_available', true);

      const priceRange = PRICE_RANGES[overridePriceRange as keyof typeof PRICE_RANGES];
      if (priceRange && priceRange.min !== null) {
        query = query.gte('price', priceRange.min);
      }
      if (priceRange && priceRange.max !== null) {
        query = query.lte('price', priceRange.max);
      }

      const { data, error: prodErr } = await query
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
    await fetchSubcategories();
    await fetchCakeCategoryIds();
    fetchBookingBanner();
    await fetchProducts(0, false);
  };

  const handleBookingPress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.push({ pathname: '../bookproducts' });
    setTimeout(() => {
      isNavigating.current = false;
    }, 500);
  };

  const handlePriceFilterChange = (range: string | null) => {
    setSelectedPriceRange(range);
    setPage(0);
    setHasMore(true);
    fetchProducts(0, false, selectedSubcategory, range);
  };

  const handleSubcategoryChange = (categoryId: string | null) => {
    setSelectedSubcategory(categoryId);
    setPage(0);
    setHasMore(true);
    fetchProducts(0, false, categoryId, selectedPriceRange);
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

  const handleProductPress = (item: Product) => {
    router.push({
      pathname: '../order',
      params: {
        id: item.id,
        name: item.name,
        price: typeof item.price === 'number' ? item.price.toString() : item.price,
        seller_id: item.seller_id || '',
        description: item.description || 'Delicious treat',
        image_urls: JSON.stringify(item.image_urls || []),
        post_type: item.post_type || 'sale',
      },
    });
  };

  const renderProductCard = (item: Product, height: number) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const imageSource = getProductImage(item);

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.tabCard, { height }]}
        onPress={() => handleProductPress(item)}
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

  const renderResponsiveGrid = useCallback(() => {
    const HEIGHT_VARIANTS = getHeightVariants(screenWidth);
    const isTablet = screenWidth > 768;

    if (!isTablet) {
      return (
        <View style={styles.masonryContainer}>
          <View style={styles.masonryColumn}>
            {products
              .filter((_, i) => i % 2 === 0)
              .map((item, i) => {
                const height = HEIGHT_VARIANTS[i % HEIGHT_VARIANTS.length];
                return renderProductCard(item, height);
              })}
          </View>

          <View style={styles.masonryColumn}>
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
    }

    const columns = numColumns;
    const columnItems: Product[][] = Array.from({ length: columns }, () => []);

    products.forEach((item, index) => {
      const columnIndex = index % columns;
      columnItems[columnIndex].push(item);
    });

    return (
      <View>
        <TouchableOpacity
          style={[styles.tabCard, styles.bookingCardTablet]}
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

        <View style={[styles.tabletGrid, { gap: 12 }]}>
          {columnItems.map((column, colIndex) => (
            <View key={`col-${colIndex}`} style={[styles.tabletColumn, { flex: 1 / columns }]}>
              {column.map((item, itemIndex) => {
                const height = HEIGHT_VARIANTS[itemIndex % HEIGHT_VARIANTS.length];
                return renderProductCard(item, height);
              })}
            </View>
          ))}
        </View>
      </View>
    );
  }, [products, bookingImageUrl, screenWidth, numColumns]);

  const renderContent = () => {
    if (loading) {
      const HEIGHT_VARIANTS = getHeightVariants(screenWidth);
      return (
        <View style={styles.masonryContainer}>
          <View style={styles.masonryColumn}>
            {[0, 2, 4].map((i) => (
              <View
                key={`left-skel-${i}`}
                style={[styles.skeletonCard, { height: HEIGHT_VARIANTS[i % HEIGHT_VARIANTS.length] }]}
              />
            ))}
          </View>
          <View style={styles.masonryColumn}>
            <View style={[styles.skeletonCard, { height: 420 }]} />
            {[0, 2].map((i) => (
              <View
                key={`right-skel-${i}`}
                style={[styles.skeletonCard, { height: HEIGHT_VARIANTS[(i + 2) % HEIGHT_VARIANTS.length] }]}
              />
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
          <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
        </View>
      );
    }

    return renderResponsiveGrid();
  };

  return (
    <View style={styles.listContainer}>
      <View style={styles.headerContainer}>
        <View style={styles.quickOrderWrapper}>
          <Quickorder />
        </View>

        <ProductFilters
          onPriceFilterChange={handlePriceFilterChange}
          selectedPriceRange={selectedPriceRange}
          onSubcategoryChange={handleSubcategoryChange}
          subcategories={subcategories}
          selectedSubcategory={selectedSubcategory}
        />
      </View>

      {renderContent()}

      {loadingMore && (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color="#6b46c1" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    paddingBottom: 50,
    width: '100%',
  },
  headerContainer: {
    width: '100%',
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 0,
    width: '100%',
  },
  quickOrderWrapper: {
    marginBottom: 8,
    minHeight: 60,
    width: '100%',
  },
  masonryColumn: {
    width: '48.5%',
    gap: 12,
  },
  tabletGrid: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 0,
    alignSelf: 'center',
    width: '100%',
  },
  tabletColumn: {
    gap: 12,
    paddingHorizontal: 4,
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
    backgroundColor: '#fff',
  },
  bookingCard: {
    height: 420,
    backgroundColor: '#6b46c1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bookingCardTablet: {
    height: 200,
    backgroundColor: '#6b46c1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
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

