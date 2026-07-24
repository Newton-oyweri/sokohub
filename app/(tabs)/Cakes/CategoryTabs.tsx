import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet, BackHandler, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router';
import Services from '../../../Services/Services';
import Fashion from '../../../Services/Fashion';
import Electronics from '../../../Services/Electronics';
import CakeCarousel from './CakeCarousel';
import { CATEGORIES, CategoryKey } from '../useHomeScreen';
import { HEADER_HEIGHT } from '../../../components/Header';

interface CategoryTabsProps {
  scrollY?: Animated.Value;
}

interface AnimatedChipProps {
  cat: typeof CATEGORIES[number];
  isActive: boolean;
  onPress: (key: CategoryKey) => void;
}

const BASE_CATEGORY: CategoryKey = 'bakery';
const isWeb = Platform.OS === 'web';

// --- Sub-component for smooth scale-on-press animation ---
function AnimatedChip({ cat, isActive, onPress }: AnimatedChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onPress(cat.key)}
    >
      <Animated.View
        style={[
          styles.categoryChip,
          isActive && styles.categoryChipActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
          {cat.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function CategoryTabs({ scrollY }: CategoryTabsProps) {
  // --- Native path: local history stack ---
  const [navHistory, setNavHistory] = useState<CategoryKey[]>([BASE_CATEGORY]);

  // --- Web path: URL-driven state ---
  const router = useRouter();
  const pathname = usePathname();
  const { category } = useLocalSearchParams<{ category?: string }>();

  // Single source of truth depending on platform
  const activeCategory: CategoryKey = isWeb
    ? (category as CategoryKey) || BASE_CATEGORY
    : navHistory[navHistory.length - 1];

  const handleSelectCategory = (key: CategoryKey) => {
    if (key === activeCategory) return;

    if (isWeb) {
      router.push({ pathname, params: { category: key } });
    } else {
      setNavHistory((prev) => {
        const filtered = prev.filter((cat) => cat !== key);
        return [...filtered, key];
      });
    }
  };

  // Hardware back button — native only, walks the local history stack
  useEffect(() => {
    if (isWeb) return;

    const onBackPress = () => {
      if (navHistory.length > 1) {
        setNavHistory((prev) => prev.slice(0, -1));
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [navHistory]);

  const categoryOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, HEADER_HEIGHT - 60],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      })
    : 1;

  // Map category keys directly to their components
  const CATEGORY_COMPONENTS: Partial<Record<CategoryKey, React.ReactNode>> = {
    bakery: <CakeCarousel />,
    services: <Services />,
    electronics: <Electronics />,
    fashion: <Fashion />,
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: categoryOpacity }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => (
            <AnimatedChip
              key={cat.key}
              cat={cat}
              isActive={activeCategory === cat.key}
              onPress={handleSelectCategory}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* Persistent Content Wrapper */}
      <View style={styles.contentBody}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          const ComponentNode = CATEGORY_COMPONENTS[cat.key];

          return (
            <View
              key={cat.key}
              style={[
                styles.categoryWrapper,
                { display: isActive ? 'flex' : 'none' },
              ]}
            >
              {ComponentNode || (
                <View style={styles.placeholderWrap}>
                  <Text style={styles.placeholderEmoji}>🚧</Text>
                  <Text style={styles.placeholderTitle}>{cat.label}</Text>
                  <Text style={styles.placeholderSubtitle}>Coming soon</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoryRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: { backgroundColor: '#6b46c1' },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: '#6b46c1' },
  categoryLabelActive: { color: '#ffffff' },
  contentBody: { flex: 1 },
  categoryWrapper: {
    flex: 1,
    width: '100%',
  },
  placeholderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  placeholderEmoji: { fontSize: 40, marginBottom: 12 },
  placeholderTitle: { fontSize: 17, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  placeholderSubtitle: { fontSize: 14, color: '#9CA3AF' },
});

