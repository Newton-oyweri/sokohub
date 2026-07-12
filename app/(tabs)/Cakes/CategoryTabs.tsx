import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

type Category = {
  id: string;
  name: string;
  subtitle: string | null;
  image_url: string | null;
};

// Base height variants for masonry layout matching
const HEIGHT_VARIANTS = [520, 380, 240, 100, 300];

// Pure Native Skeleton Loader
function CategorySkeleton() {
  return (
    <View style={styles.masonryContainer}>
      {/* Left Skeleton Column */}
      <View style={styles.masonryColumn}>
        {[0, 2, 4].map((index) => {
          const height = HEIGHT_VARIANTS[index % HEIGHT_VARIANTS.length];
          return <View key={`left-skel-${index}`} style={[styles.skeletonCard, { height }]} />;
        })}
      </View>

      {/* Right Skeleton Column */}
      <View style={styles.masonryColumn}>
        {/* Large Top Right Booking Placeholder */}
        <View style={[styles.skeletonCard, { height: 420 }]} />
        {[0, 2].map((index) => {
          const height = HEIGHT_VARIANTS[(index + 2) % HEIGHT_VARIANTS.length];
          return <View key={`right-skel-${index}`} style={[styles.skeletonCard, { height }]} />;
        })}
      </View>
    </View>
  );
}

export default function CategoryTabs() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [bookingImageUrl, setBookingImageUrl] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      // 1. Fetch Categories
      const categoriesPromise = supabase
        .from('categories')
        .select('id, name, subtitle, image_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      // 2. First get the total count of valid booking products for a true random offset range
      const countPromise = supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('post_type', 'booking')
        .eq('is_available', true)
        .not('image_urls', 'is', null);

      const [categoriesRes, countRes] = await Promise.all([
        categoriesPromise,
        countPromise,
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      setCategories(categoriesRes.data || []);

      const totalCount = countRes.count || 0;

      // 3. If rows exist, choose a completely random offset index and query that single record
      if (totalCount > 0) {
        const randomOffset = Math.floor(Math.random() * totalCount);

        const { data: randomProductData } = await supabase
          .from('products')
          .select('image_urls')
          .eq('post_type', 'booking')
          .eq('is_available', true)
          .not('image_urls', 'is', null)
          .range(randomOffset, randomOffset)
          .single();

        if (randomProductData?.image_urls && Array.isArray(randomProductData.image_urls) && randomProductData.image_urls.length > 0) {
          setBookingImageUrl(randomProductData.image_urls[0]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching component data:', err.message);
      setCategoriesError('Could not load categories.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const isNavigating = useRef(false);
  const openCategory = (cat: Category) => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    router.push({
      pathname: '../products',
      params: { category: cat.id, categoryName: cat.name },
    });

    setTimeout(() => {
      isNavigating.current = false;
    }, 500); 
  };

  const handleBookingPress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    router.push({ pathname: '../bookproducts' });

    setTimeout(() => {
      isNavigating.current = false;
    }, 500);
  };

  const renderCategoryTabs = useCallback(() => {
    if (categoriesLoading) {
      return <CategorySkeleton />;
    }

    if (categoriesError) {
      return (
        <View style={[styles.tabScroll, styles.centerRow]}>
          <Text style={styles.errorText}>{categoriesError}</Text>
          <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (categories.length === 0) {
      return (
        <View style={[styles.tabScroll, styles.centerRow]}>
          <Text style={styles.errorText}>No categories available.</Text>
        </View>
      );
    }

    return (
      <View style={styles.masonryContainer}>
        {/* Left Column (Renders even-indexed categories natively) */}
        <View style={styles.masonryColumn}>
          {categories
            .filter((_, i) => i % 2 === 0)
            .map((cat, i) => {
              const height = HEIGHT_VARIANTS[i % HEIGHT_VARIANTS.length];
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.tabCard, { height }]}
                  onPress={() => openCategory(cat)}
                  activeOpacity={0.95}
                >
                  <Image
                    source={cat.image_url ? { uri: cat.image_url } : undefined}
                    style={styles.tabImage}
                    resizeMode="cover"
                  />
                  <View style={styles.tabOverlay}>
                    <Text style={styles.tabLabel}>{cat.name}</Text>
                    {!!cat.subtitle && <Text style={styles.tabSubtitle}>{cat.subtitle}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>

        {/* Right Column (Sacrifices first element for the main Booking CTA) */}
        <View style={styles.masonryColumn}>
          
          {/* Main Large Booking Block Card */}
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
                {/* Darker overlay mask so white text stands out on top of user uploaded images */}
                <View style={styles.bookingImageOverlay} />
              </>
            )}
            <View style={styles.bookingCardContent}>
              <Text style={styles.bookingQuestion}>Got an event?</Text>
              <Text style={styles.bookingAction}>Book now!</Text>
            </View>
          </TouchableOpacity>

          {/* Odd-indexed categories populate below the booking container */}
          {categories
            .filter((_, i) => i % 2 === 1)
            .map((cat, i) => {
              const height = HEIGHT_VARIANTS[(i + 2) % HEIGHT_VARIANTS.length];
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.tabCard, { height }]}
                  onPress={() => openCategory(cat)}
                  activeOpacity={0.95}
                >
                  <Image
                    source={cat.image_url ? { uri: cat.image_url } : undefined}
                    style={styles.tabImage}
                    resizeMode="cover"
                  />
                  <View style={styles.tabOverlay}>
                    <Text style={styles.tabLabel}>{cat.name}</Text>
                    {!!cat.subtitle && <Text style={styles.tabSubtitle}>{cat.subtitle}</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      </View>
    );
  }, [categories, bookingImageUrl, categoriesLoading, categoriesError]);

  return (
    <View>
      {renderCategoryTabs()}
    </View>
  );
}

const styles = StyleSheet.create({
  tabScroll: {
    marginBottom: 16,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    justifyContent: 'center',
    gap: 10,
  },
  errorText: {
    color: '#64748b',
    fontSize: 14,
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
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  masonryColumn: {
    width: '48%',
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
    height: 420, 
    backgroundColor: '#6b46c1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bookingImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(107, 70, 193, 0.45)', // Blends theme color over background picture elegantly
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 12,
  },
  tabLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  tabSubtitle: {
    fontSize: 13,
    color: '#f1e8ff',
    marginTop: 2,
  },
});