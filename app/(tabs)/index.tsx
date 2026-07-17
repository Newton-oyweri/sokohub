import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CakeCarousel from './Cakes/CakeCarousel';
import Account from './Account/Account';
import Header, { HEADER_HEIGHT } from '../../components/Header';
import { supabase } from '../../lib/supabase';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 0;

// Above this viewport width, we switch to the branded split layout:
// app content capped at phone width on the left, branding panel on the right.
const WIDE_LAYOUT_BREAKPOINT = 900;
const APP_COLUMN_WIDTH = 480;

// This is now the ONLY route for this screen. Do not create a second
// route file for Account — it is a tab of this shell, not a destination.
export default function App() {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= WIDE_LAYOUT_BREAKPOINT;

  // Supports deep-linking straight to a tab, e.g. router.push("/(tabs)?tab=account")
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<'cakes' | 'account'>(
    tab === 'account' ? 'account' : 'cakes'
  );

  // Auth & Profile states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Guest User');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Notifications State & Animation Refs
  const [unreadCount, setUnreadCount] = useState(0);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const shakeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated value tracker for scroll management
  const scrollY = useRef(new Animated.Value(0)).current;

  // Simple tab switch — no navigation, no stack push, just local state.
  const handleAccountPress = () => {
    setActiveTab('account');
  };

  const handleShopPress = () => {
    setActiveTab('cakes');
  };

  // --- CORE AUTH LIFECYCLE ---
  useEffect(() => {
    checkUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsLoggedIn(true);
        fetchProfileDetails(session.user.id);
        fetchUnreadCount(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserName('Guest User');
        setAvatarUrl(null);
        setUnreadCount(0);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUserSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
      fetchProfileDetails(session.user.id);
      fetchUnreadCount(session.user.id);
    }
  };

  const fetchProfileDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (data) {
        setUserName(data.full_name?.trim() || 'New User');
        setAvatarUrl(data.avatar_url || null);
      }
    } catch (err) {
      console.log('Error fetching greeting assets:', err);
    }
  };

  // --- NOTIFICATION LIFECYCLE MANAGEMENT ---
  const fetchUnreadCount = async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    } catch (err) {
      console.log('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    let channel: any = null;

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const userId = session.user.id;

      channel = supabase
        .channel(`realtime-unread-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchUnreadCount(userId);
          }
        );

      channel.subscribe();
    };

    if (isLoggedIn) {
      setupRealtime();
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (shakeIntervalRef.current) {
      clearInterval(shakeIntervalRef.current);
      shakeIntervalRef.current = null;
    }

    if (unreadCount > 0) {
      triggerBellShake();

      shakeIntervalRef.current = setInterval(() => {
        triggerBellShake();
      }, 4000);
    } else {
      shakeAnimation.setValue(0);
    }

    return () => {
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current);
      }
    };
  }, [unreadCount]);

  const triggerBellShake = () => {
    shakeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 1, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -1, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 1, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -1, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0.6, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -0.6, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

  const bellRotation = shakeAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // The actual app UI — unchanged from the phone layout, just rendered inside
  // whichever wrapper the breakpoint below picks.
  const appContent = (
    <View style={styles.container}>
      {/* Background Header */}
      <View style={[styles.headerBackground, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <Header />
      </View>

      {/* Main Scrollable Content */}
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
        {/* Dynamic Fading Greeting Row */}
        <Animated.View
          style={[
            styles.greetingSpacer,
            { height: HEADER_HEIGHT - 60, opacity: greetingOpacity }
          ]}
        >
          <Text style={styles.welcomeText}>
            Welcome, <Text style={styles.highlightText}>{userName}</Text> 👋
          </Text>
        </Animated.View>

        {/* Premium Sticky Tabs */}
        <View style={styles.stickyTabsWrapper}>
          <View style={styles.tabsContainer}>

            {/* Shop Tab */}
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'cakes' && styles.activeTabButton]}
              onPress={handleShopPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeTab === 'cakes' ? "storefront" : "storefront-outline"}
                size={20}
                color={activeTab === 'cakes' ? '#6b46c1' : '#9CA3AF'}
              />
              <Text style={[styles.tabText, activeTab === 'cakes' && styles.activeTabText]}>
                Shop
              </Text>
            </TouchableOpacity>

            {/* Account Tab */}
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'account' && styles.activeTabButton]}
              onPress={handleAccountPress}
              activeOpacity={0.8}
            >
              {isLoggedIn && avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={[
                    styles.tabAvatar,
                    activeTab === 'account' && styles.activeTabAvatar
                  ]}
                />
              ) : (
                <Ionicons
                  name={activeTab === 'account' ? "person" : "person-outline"}
                  size={20}
                  color={activeTab === 'account' ? "#6b46c1" : "#9CA3AF"}
                />
              )}
              <Text style={[styles.tabText, activeTab === 'account' && styles.activeTabText]}>
                Account
              </Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Content Card Panel */}
        <View style={styles.contentCard}>
          <View style={styles.contentBody}>
            {activeTab === 'cakes' ? <CakeCarousel /> : <Account />}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Upgraded Animated Notification Bell Container */}
      <TouchableOpacity
        style={[styles.fixedNotifIconContainer, { top: STATUS_BAR_HEIGHT + 12 }]}
        activeOpacity={0.7}
        onPress={() => router.push("/notifications")}
      >
        <Animated.View style={{ transform: [{ rotate: bellRotation }] }}>
          <Ionicons
            name={unreadCount > 0 ? "notifications" : "notifications-outline"}
            size={24}
            color={unreadCount > 0 ? "#6b46c1" : "#1F2937"}
          />
        </Animated.View>

        {unreadCount > 0 && <View style={styles.badgeIndicator} />}
      </TouchableOpacity>
    </View>
  );

  // Narrow viewport (or actual mobile browser): behave exactly like before.
  if (!isWideLayout) {
    return appContent;
  }

  // Wide viewport: app content capped at phone width on the left,
  // branding panel filling the remaining space on the right.
  return (
    <View style={styles.wideRoot}>
      <View style={styles.wideAppColumn}>
        {appContent}
      </View>
      <View style={styles.brandingPanel}>
        <Text style={styles.brandingText}>Wonderbakes</Text>
      </View>
    </View>
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
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentBody: {
    flex: 1,
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

  // --- Wide layout (desktop web) styles ---
  wideRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#6b46c1',
  },
  wideAppColumn: {
    width: APP_COLUMN_WIDTH,
    height: '100%',
    // Subtle shadow so the app column reads as a distinct "device" against
    // the branding panel, without any extra design work.
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  brandingPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b46c1',
  },
  brandingText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
  },
});
