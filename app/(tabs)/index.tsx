import React, { useState, useEffect, useRef } from 'react';
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
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryTabs, { CategoryTabsHandle } from './Cakes/CategoryTabs';
import Account from './Account/Account';
import Header, { HEADER_HEIGHT } from '../../components/Header';
import DownloadAction from '../../components/DownloadAction';
import { useHomeScreen } from './useHomeScreen';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 0;

function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const standalone =
      (typeof window.matchMedia === 'function' &&
        window.matchMedia('(display-mode: standalone)').matches) ||
      // @ts-ignore - iOS Safari specific
      window.navigator.standalone === true;

    setIsPWA(standalone);
  }, []);

  return isPWA;
}

export default function App() {
  const {
    activeTab,
    handleShopPress,
    handleAccountPress,
    isLoggedIn,
    userName,
    avatarUrl,
    unreadCount,
    bellRotation,
    greetingOpacity,
    scrollY,
    handleSearchPress,
  } = useHomeScreen();

  const isPWA = useIsPWA();

  // 1. Ref to trigger CategoryTabs -> CakeCarousel -> loadMore
  const categoryTabsRef = useRef<CategoryTabsHandle>(null);

  // 2. Animated scroll handler + infinite scroll bottom detector
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isNearBottom =
          layoutMeasurement.height + contentOffset.y >= contentSize.height - 250;

        if (isNearBottom && activeTab === 'cakes') {
          categoryTabsRef.current?.loadMore();
        }
      },
    }
  );

  return (
    <>
      {Platform.OS === 'web' && !isPWA && <DownloadAction />}
      <View style={styles.container}>
        <View style={[styles.headerBackground, { paddingTop: STATUS_BAR_HEIGHT }]}>
          <Header />
        </View>

        <Animated.ScrollView
          style={StyleSheet.absoluteFillObject}
          contentContainerStyle={[styles.scrollContent, { paddingTop: STATUS_BAR_HEIGHT }]}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Transparent Search Bar overlay on top banner */}
          <Animated.View
            style={[
              styles.greetingSpacer,
              { height: HEADER_HEIGHT - 40, opacity: greetingOpacity },
            ]}
          >
            <TouchableOpacity
              style={styles.transparentSearchBar}
              activeOpacity={0.85}
              onPress={handleSearchPress}
            >
              <Ionicons name="search-outline" size={20} color="#6b46c1" />
              <Text style={styles.searchPlaceholderText} numberOfLines={1}>
                Welcome <Text style={styles.highlightName}>{userName}</Text>, what are you looking for today?
              </Text>
            </TouchableOpacity>
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
          </View>

          <View style={styles.contentCard}>
            {activeTab === 'cakes' ? (
              <CategoryTabs ref={categoryTabsRef} scrollY={scrollY} />
            ) : (
              <Account />
            )}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transparentSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchPlaceholderText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  highlightName: {
    color: '#6b46c1',
    fontWeight: '700',
  },
  stickyTabsWrapper: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 16,
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
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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

