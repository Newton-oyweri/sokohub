import React, { useState, useEffect, useRef } from 'react';

  import { router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CakeCarousel from './Cakes/CakeCarousel';
import Account from './Account/Account'; 
import Header, { HEADER_HEIGHT } from '../../components/Header'; 
import { supabase } from '../../lib/supabase';

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 0;

export default function App() {
  const [activeTab, setActiveTab] = useState<'cakes' | 'account'>('cakes');

  // Auth & Profile states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Guest User');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // 1. Animated value tracker for scroll management
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsLoggedIn(true);
        fetchProfileDetails(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserName('Guest User');
        setAvatarUrl(null);
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

  // 2. Map the scroll position to an opacity scale (fades out completely over 80px of scrolling)
  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>

      {/* Background Header */}
      <View style={[styles.headerBackground, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <Header />
      </View>

      {/* Main Scrollable Content - Changed to Animated.ScrollView */}
      <Animated.ScrollView 
        style={StyleSheet.absoluteFillObject}
        contentContainerStyle={[styles.scrollContent, { paddingTop: STATUS_BAR_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} 
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true } // Utilizes hardware acceleration for fluid performance
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
              onPress={() => setActiveTab('cakes')}
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
              onPress={() => setActiveTab('account')}
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
            {activeTab === 'cakes' ? <CakeCarousel />  : <Account />}
          </View>
        </View>
      </Animated.ScrollView>


{/* Notification Bell */}
<TouchableOpacity
  style={[styles.fixedNotifIconContainer, { top: STATUS_BAR_HEIGHT + 12 }]}
  activeOpacity={0.7}
  onPress={() => router.push("/notifications")}
>
  <Ionicons
    name="notifications-outline"
    size={24}
    color="#1F2937"
  />
  <View style={styles.badgeIndicator} />
</TouchableOpacity>
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
  /* Upgraded Premium Sticky Navigation Layout */
  stickyTabsWrapper: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    /* Added padding to prevent overlapping with system components / statusbar */
    paddingTop: Platform.OS === 'ios' ? 30 : 30, 
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
    /* Ensuring clean separation layout structure below device barriers */
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
    top: 10,
    right: 10,
    backgroundColor: '#EF4444',
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});