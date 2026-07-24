// Sizeguide.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

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

const CLOTH_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45'];
const COLORS = [
  { name: 'Black', hex: '#0f172a' },
  { name: 'White', hex: '#ffffff', border: '#cbd5e1' },
  { name: 'Khaki', hex: '#c2b280' },
  { name: 'Olive', hex: '#556b2f' },
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Beige', hex: '#f5f5dc', border: '#e2e8f0' },
];

type GuideType = 'cloth' | 'shoe';

interface SizeGuideSelectorProps {
  categoryId?: string;
  productCategoryId?: string;
  selectedSize: string;
  onSelectSize: (size: string) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function SizeGuideSelector({
  categoryId,
  productCategoryId,
  selectedSize,
  onSelectSize,
  selectedColor,
  onSelectColor,
}: SizeGuideSelectorProps) {
  const [activeGuide, setActiveGuide] = useState<GuideType | null>(null);

  // Check if product belongs to fashion
  const isFashion =
    productCategoryId?.toLowerCase() === 'fashion' ||
    categoryId?.toLowerCase().includes('fashion') ||
    categoryId?.toLowerCase().includes('cloth') ||
    categoryId?.toLowerCase().includes('shoe');

  if (!isFashion) return null;

  const toggleGuide = (type: GuideType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveGuide((prev) => (prev === type ? null : type));
  };

  const isShoeCategory = categoryId?.toLowerCase().includes('shoe');
  const availableSizes = isShoeCategory ? SHOE_SIZES : CLOTH_SIZES;

  return (
    <View style={styles.container}>
      {/* 1. Size Selection */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          Select Size {selectedSize ? `· ${selectedSize}` : ''}
        </Text>
      </View>
      <View style={styles.chipRow}>
        {availableSizes.map((size) => {
          const isSelected = selectedSize === size;
          return (
            <TouchableOpacity
              key={size}
              style={[styles.sizeChip, isSelected && styles.sizeChipSelected]}
              onPress={() => onSelectSize(size)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sizeChipText,
                  isSelected && styles.sizeChipTextSelected,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Color Selection */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
        Select Color {selectedColor ? `· ${selectedColor}` : ''}
      </Text>
      <View style={styles.chipRow}>
        {COLORS.map((col) => {
          const isSelected = selectedColor === col.name;
          return (
            <TouchableOpacity
              key={col.name}
              style={[
                styles.colorChip,
                { backgroundColor: col.hex },
                col.border ? { borderWidth: 1, borderColor: col.border } : null,
                isSelected && styles.colorChipSelected,
              ]}
              onPress={() => onSelectColor(col.name)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={col.hex === '#ffffff' || col.hex === '#f5f5dc' ? '#0f172a' : '#ffffff'}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Expandable Size Chart Accordion Triggers */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeGuide === 'cloth' && styles.activeTab]}
          onPress={() => toggleGuide('cloth')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="shirt-outline"
            size={16}
            color={activeGuide === 'cloth' ? '#6b46c1' : '#64748b'}
          />
          <Text
            style={[
              styles.tabText,
              activeGuide === 'cloth' && styles.activeTabText,
            ]}
          >
            Clothing Guide
          </Text>
          <Ionicons
            name={activeGuide === 'cloth' ? 'chevron-up' : 'chevron-down'}
            size={14}
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
            size={16}
            color={activeGuide === 'shoe' ? '#6b46c1' : '#64748b'}
          />
          <Text
            style={[
              styles.tabText,
              activeGuide === 'shoe' && styles.activeTabText,
            ]}
          >
            Shoe Guide
          </Text>
          <Ionicons
            name={activeGuide === 'shoe' ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={activeGuide === 'shoe' ? '#6b46c1' : '#64748b'}
          />
        </TouchableOpacity>
      </View>

      {/* 4. Expanded Image View */}
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    minWidth: 44,
    alignItems: 'center',
  },
  sizeChipSelected: {
    borderColor: '#6b46c1',
    backgroundColor: '#faf5ff',
  },
  sizeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  sizeChipTextSelected: {
    color: '#6b46c1',
    fontWeight: '700',
  },
  colorChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorChipSelected: {
    borderWidth: 2.5,
    borderColor: '#6b46c1',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  activeTab: {
    borderColor: '#6b46c1',
    backgroundColor: '#faf5ff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabText: {
    color: '#6b46c1',
  },
  imageCard: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b46c1',
    marginBottom: 8,
  },
  guideImage: {
    width: '100%',
    borderRadius: 8,
  },
});

