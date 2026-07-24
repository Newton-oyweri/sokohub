import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { supabase } from '@/lib/supabase'; // Adjust path to your Supabase client instance

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SIZE_GUIDES = {
  cloth: {
    title: 'Clothing Size Guide',
    url: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/clothSize.jpg',
    aspectRatio: 1 / 1.5,
  },
  shoe: {
    title: 'Shoe Size Guide',
    url: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/shoesSize.jpg',
    aspectRatio: 1 / 1.5,
  },
};

type GuideType = 'cloth' | 'shoe';

interface SizeGuideSelectorProps {
  categoryId?: string;           // products.category (FK -> categories.id)
  productCategoryId?: string;    // Direct route param if available
}

export default function SizeGuideSelector({
  categoryId,
  productCategoryId,
}: SizeGuideSelectorProps) {
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);
  const [resolvedProductCatId, setResolvedProductCatId] = useState<string | null>(
    productCategoryId || null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If productCategoryId was passed directly via params, no need to query
    if (productCategoryId) {
      setResolvedProductCatId(productCategoryId);
      return;
    }

    // Otherwise, fetch categories.product_category_id using categoryId (categories.id)
    if (!categoryId) return;

    let isMounted = true;

    async function fetchProductCategoryId() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('product_category_id')
          .eq('id', categoryId)
          .single();

        if (error) {
          console.error('Error fetching product category:', error.message);
          return;
        }

        if (isMounted && data?.product_category_id) {
          setResolvedProductCatId(data.product_category_id);
        }
      } catch (err) {
        console.error('Failed to resolve category:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProductCategoryId();

    return () => {
      isMounted = false;
    };
  }, [categoryId, productCategoryId]);

  // Check if the resolved parent category ID is 'fashion'
  const isFashion = resolvedProductCatId?.toLowerCase() === 'fashion';

  if (loading) {
    return null; // Silent load while checking category
  }

  if (!isFashion) {
    return null; // Hide completely for non-fashion items
  }

  const toggleGuide = (type: GuideType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveGuide((prev) => (prev === type ? null : type));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Size Guides</Text>

      {/* Accordion Trigger Buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeGuide === 'cloth' && styles.activeTab]}
          onPress={() => toggleGuide('cloth')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="shirt-outline"
            size={18}
            color={activeGuide === 'cloth' ? '#6b46c1' : '#64748b'}
          />
          <Text
            style={[
              styles.tabText,
              activeGuide === 'cloth' && styles.activeTabText,
            ]}
          >
            Clothing Chart
          </Text>
          <Ionicons
            name={activeGuide === 'cloth' ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={activeGuide === 'cloth' ? '#6b46c1' : '#64748b'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeGuide === 'shoe' && styles.activeTab]}
          onPress={() => toggleGuide('shoe')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="footsteps-outline"
            size={18}
            color={activeGuide === 'shoe' ? '#6b46c1' : '#64748b'}
          />
          <Text
            style={[
              styles.tabText,
              activeGuide === 'shoe' && styles.activeTabText,
            ]}
          >
            Shoe Chart
          </Text>
          <Ionicons
            name={activeGuide === 'shoe' ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={activeGuide === 'shoe' ? '#6b46c1' : '#64748b'}
          />
        </TouchableOpacity>
      </View>

      {/* Expanded Image View */}
      {activeGuide && (
        <View style={styles.imageCard}>
          <Text style={styles.imageTitle}>{SIZE_GUIDES[activeGuide].title}</Text>
          <Image
            source={{ uri: SIZE_GUIDES[activeGuide].url }}
            style={[
              styles.guideImage,
              { aspectRatio: SIZE_GUIDES[activeGuide].aspectRatio },
            ]}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  activeTab: {
    borderColor: '#6b46c1',
    backgroundColor: '#faf5ff',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#6b46c1',
  },
  imageCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b46c1',
    marginBottom: 10,
  },
  guideImage: {
    width: '100%',
    borderRadius: 10,
  },
});

