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
const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

const COLORS = [
  { name: 'Black', hex: '#0f172a' },
  { name: 'White', hex: '#ffffff', border: '#cbd5e1' },
  { name: 'Khaki', hex: '#c2b280' },
  { name: 'Olive', hex: '#556b2f' },
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Beige', hex: '#f5f5dc', border: '#cbd5e1' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Grey', hex: '#64748b' },
  { name: 'Brown', hex: '#78350f' },
];

type GuideType = 'cloth' | 'shoe';
type SizeType = 'cloth' | 'shoe';

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
  const [isExpanded, setIsExpanded] = useState(false); // Start closed

  const initialSizeType: SizeType =
    categoryId?.toLowerCase().includes('shoe') ||
    productCategoryId?.toLowerCase().includes('shoe')
      ? 'shoe'
      : 'cloth';

  const [selectedSizeType, setSelectedSizeType] = useState<SizeType>(initialSizeType);

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

  const handleSizeTypeChange = (type: SizeType) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedSizeType(type);
    // Reset to default size for the selected category type
    onSelectSize(type === 'shoe' ? SHOE_SIZES[2] : CLOTH_SIZES[3]);
  };

  const availableSizes = selectedSizeType === 'shoe' ? SHOE_SIZES : CLOTH_SIZES;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Header with prompt and expand/collapse button */}
      <TouchableOpacity
        style={styles.headerContainer}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="shirt-outline" size={20} color="#6b46c1" />
          <Text style={styles.headerPrompt}>
            Shopping for cloth or shoe choose size here
          </Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#6b46c1"
        />
      </TouchableOpacity>

      {/* Collapsible Content - Only shown when expanded */}
      {isExpanded && (
        <View style={styles.contentContainer}>
          {/* 1. Size Type Toggle (Clothing vs Shoes) */}
          <View style={styles.sizeTypeToggleRow}>
            <TouchableOpacity
              style={[
                styles.typeChip,
                selectedSizeType === 'cloth' && styles.typeChipActive,
              ]}
              onPress={() => handleSizeTypeChange('cloth')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="shirt-outline"
                size={15}
                color={selectedSizeType === 'cloth' ? '#6b46c1' : '#64748b'}
              />
              <Text
                style={[
                  styles.typeChipText,
                  selectedSizeType === 'cloth' && styles.typeChipTextActive,
                ]}
              >
                Clothing Sizes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeChip,
                selectedSizeType === 'shoe' && styles.typeChipActive,
              ]}
              onPress={() => handleSizeTypeChange('shoe')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="footsteps-outline"
                size={15}
                color={selectedSizeType === 'shoe' ? '#6b46c1' : '#64748b'}
              />
              <Text
                style={[
                  styles.typeChipText,
                  selectedSizeType === 'shoe' && styles.typeChipTextActive,
                ]}
              >
                Shoe Sizes
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2. Size Values Selector */}
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

          {/* 3. Color Selection with Color Pills & Labels */}
          <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
            Select Color {selectedColor ? `· ${selectedColor}` : ''}
          </Text>
          <View style={styles.chipRow}>
            {COLORS.map((col) => {
              const isSelected = selectedColor === col.name;
              return (
                <TouchableOpacity
                  key={col.name}
                  style={[
                    styles.colorCard,
                    isSelected && styles.colorCardSelected,
                  ]}
                  onPress={() => onSelectColor(col.name)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.colorDot,
                      { backgroundColor: col.hex },
                      col.border ? { borderWidth: 1, borderColor: col.border } : null,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={
                          col.hex === '#ffffff' || col.hex === '#f5f5dc'
                            ? '#0f172a'
                            : '#ffffff'
                        }
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.colorLabel,
                      isSelected && styles.colorLabelSelected,
                    ]}
                  >
                    {col.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 4. Expandable Size Chart Accordion Triggers */}
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

          {/* 5. Expanded Image View */}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#faf5ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  sizeTypeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeChipActive: {
    backgroundColor: '#faf5ff',
    borderColor: '#6b46c1',
  },
  typeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  typeChipTextActive: {
    color: '#6b46c1',
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
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
  colorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  colorCardSelected: {
    borderColor: '#6b46c1',
    backgroundColor: '#faf5ff',
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  colorLabelSelected: {
    color: '#6b46c1',
    fontWeight: '700',
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
