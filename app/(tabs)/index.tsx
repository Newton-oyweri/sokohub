import React from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CakeCarousel from './Cakes/CakeCarousel';
import Account from './Account/Account';
import Header, { HEADER_HEIGHT } from '../../components/Header';
import DownloadAction from '../../components/DownloadAction';
import { useHomeScreen, CATEGORIES, CategoryKey } from './useHomeScreen';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 0;

// Simple mock placeholder shown for every category that doesn't have
// real content yet. Swap these out for real components as each
// category gets built.
function CategoryPlaceholder({ label }: { label: string }) {
  return (
    <View style={styles.placeholderWrap}>
      <Text style={styles.placeholderEmoji}>🚧</Text>
      <Text style={styles.placeholderTitle}>{label}</Text>
      <Text style={styles.placeholderSubtitle}>Coming soon</Text>
    </View>
  );
}

// Renders whichever category is active. Bakery is the only category
// with a real component (CakeCarousel); everything else is a mock
// placeholder until that category is built out.
function CategoryContent({ category }: { category: CategoryKey }) {
  if (category === 'bakery') {
    return (
      <>
        <Text style={styles.bakeryPrompt}>What's your dessert today? 🍰</Text>
        <CakeCarousel />
      </>
    );
  }

  const meta = CATEGORIES.find((c) => c.key === category)!;
  return <CategoryPlaceholder label={meta.label} />;
}

// This is now the ONLY route for this screen. Do not create a second
// route file for Account — it is a tab of this shell, not a destination.
export default function App() {
  const {
    activeTab,
    handleShopPress,
    handleAccountPress,
    activeCategory,
    handleCategoryPress,
    isLoggedIn,
    userName,
    avatarUrl,
    unreadCount,
    bellRotation,
    greetingOpacity,
    scrollY,
  } = useHomeScreen();

  return (
    <>
      <DownloadAction />
      <View style={styles.container}>
        <View style={[styles.headerBackground, { paddingTop: STATUS_BAR_HEIGHT }]}>
          <Header />
        </View>

        <Animated.ScrollView
          style={StyleSheet.absoluteFillObject}
          contentContainerStyle={[styles.scrollContent, { paddingTop: STATUS_BAR_HEIGHT }]}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        >
          <Animated.View
            style={[styles.greetingSpacer, { height: HEADER_HEIGHT - 60, opacity: greetingOpacity }]}
          >
            <Text style={styles.welcomeText}>
              Welcome, <Text style={styles.highlightText}>{userName}</Text> 👋
            </Text>
          </Animated.View>

          <View style={styles.stickyTabsWrapper}>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'cakes' && styles.activeTabButton]}
                onPress={handleShopPress}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={activeTab === 'cakes' ? 'storefront' : 'storefront-outline'}
                  size={20}
                  color={activeTab === 'cakes' ? '#6b46c1' : '#9CA3AF'}
                />
                <Text style={[styles.tabText, activeTab === 'cakes' && styles.activeTabText]}>
                  Shop
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === 'account' && styles.activeTabButton]}
                onPress={handleAccountPress}
                activeOpacity={0.8}
              >
                {isLoggedIn && avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={[styles.tabAvatar, activeTab === 'account' && styles.activeTabAvatar]}
                  />
                ) : (
                  <Ionicons
                    name={activeTab === 'account' ? 'person' : 'person-outline'}
                    size={20}
                    color={activeTab === 'account' ? '#6b46c1' : '#9CA3AF'}
                  />
                )}
                <Text style={[styles.tabText, activeTab === 'account' && styles.activeTabText]}>
                  Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category row — only relevant while on the Shop tab */}
            {activeTab === 'cakes' && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <TouchableOpacity
                      key={cat.key}
                      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                      onPress={() => handleCategoryPress(cat.key)}
                      activeOpacity={0.8}
                    >
                
                      <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          <View style={styles.contentCard}>
            <View style={styles.contentBody}>
              {activeTab === 'cakes' ? (
                <CategoryContent category={activeCategory} />
              ) : (
                <Account />
              )}
            </View>
          </View>
        </Animated.ScrollView>

        <TouchableOpacity
          style={[styles.fixedNotifIconContainer, { top: STATUS_BAR_HEIGHT + 12 }]}
          activeOpacity={0.7}
          onPress={() => router.push('/notifications')}
        >
          <Animated.View style={{ transform: [{ rotate: bellRotation }] }}>
            <Ionicons
              name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
              size={24}
              color={unreadCount > 0 ? '#6b46c1' : '#1F2937'}
            />
          </Animated.View>
          {unreadCount > 0 && <View style={styles.badgeIndicator} />}
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4FF',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  greetingSpacer: {
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  highlightText: {
    color: '#6b46c1',
    fontWeight: '700',
  },
  stickyTabsWrapper: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 30,
    paddingBottom: 12,
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3efff',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 4,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 120,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: '#f3efff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#6b46c1',
    fontWeight: '700',
  },
  tabAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  activeTabAvatar: {
    borderColor: '#6b46c1',
    borderWidth: 1.5,
  },
  categoryRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F4FF',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#6b46c1',
  },
  categoryIcon: {
    fontSize: 15,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b46c1',
  },
  categoryLabelActive: {
    color: '#ffffff',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentBody: {
    flex: 1,
  },
  bakeryPrompt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  placeholderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  placeholderEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  placeholderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  fixedNotifIconContainer: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#FFFFFF',
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeIndicator: {
    position: 'absolute',
    top: 12,
    right: 13,
    backgroundColor: '#EF4444',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
