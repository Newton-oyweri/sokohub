import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@/lib/Storage';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';
import NotLoggedInCard from './NotLoggedInCard';

const CACHE_KEY = 'user_account_cache';

export default function AccountContent() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [selectedTab, setSelectedTab] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Main UI States
  const [userName, setUserName] = useState<string>('New User');
  const [userEmail, setUserEmail] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number>(0);
  
  // New Personal Profile States
  const [birthday, setBirthday] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  // 1. Local Cache Functions
  const saveToCache = async (data: any) => {
    try {
      await storage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
  };

  const loadFromCache = async () => {
    try {
      const cached = await storage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setUserName(parsed.userName || 'Wonderland Customer');
        setUserEmail(parsed.userEmail || '');
        setAvatarUrl(parsed.avatarUrl || null);
        setWalletBalance(parsed.walletBalance ?? null);
        setOrderCount(parsed.orderCount || 0);
        setBirthday(parsed.birthday || null);
        setGender(parsed.gender || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Optimized Combined Background Data Fetch
  const fetchFreshData = useCallback(async (userId: string, email: string) => {
    try {
      // Run all queries simultaneously in the background (including birthday & gender now)
      const [profileRes, walletRes, orderRes] = await Promise.all([
        supabase.from('profiles').select('full_name, avatar_url, birthday, gender').eq('id', userId).single(),
        supabase.from('wallets').select('balance').eq('user_id', userId).single(),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('customer_id', userId)
      ]);

      let freshName = 'Wonderland Customer';
      let freshAvatar = null;
      let freshBalance = null;
      let freshOrders = 0;
      let freshBirthday = null;
      let freshGender = null;

      if (profileRes.data) {
        freshName = profileRes.data.full_name?.trim() || 'Wonderland Customer';
        freshAvatar = profileRes.data.avatar_url || null;
        freshBirthday = profileRes.data.birthday || null;
        freshGender = profileRes.data.gender || null;
      }

      if (walletRes.data) {
        freshBalance = walletRes.data.balance;
      }

      if (orderRes.count) {
        freshOrders = orderRes.count;
      }

      // Update States
      setUserName(freshName);
      setUserEmail(email);
      setAvatarUrl(freshAvatar);
      setWalletBalance(freshBalance);
      setOrderCount(freshOrders);
      setBirthday(freshBirthday);
      setGender(freshGender);

      // Silently update cache for the next app open
      await saveToCache({
        userName: freshName,
        userEmail: email,
        avatarUrl: freshAvatar,
        walletBalance: freshBalance,
        orderCount: freshOrders,
        birthday: freshBirthday,
        gender: freshGender,
      });

    } catch (error) {
      console.error('Background fetch failed:', error);
    }
  }, []);

  // 3. Mount Logic & Auth Listener
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // STEP A: Instantly load whatever we have cached first!
      await loadFromCache();

      const { data: { session } } = await supabase.auth.getSession();

      if (session && mounted) {
        setIsLoggedIn(true);
        // STEP B: Fetch fresh data silently in background
        fetchFreshData(session.user.id, session.user.email || '');
      } else if (mounted) {
        setIsLoggedIn(false);
        resetGuestState();
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session) {
          setIsLoggedIn(true);
          fetchFreshData(session.user.id, session.user.email || '');
        } else {
          setIsLoggedIn(false);
          resetGuestState();
          await storage.removeItem(CACHE_KEY);
        }
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchFreshData]);

  const resetGuestState = () => {
    setUserName('Guest User');
    setUserEmail('');
    setAvatarUrl(null);
    setWalletBalance(null);
    setOrderCount(0);
    setBirthday(null);
    setGender(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchFreshData(session.user.id, session.user.email || '');
    }
    setRefreshing(false);
  };

  // Navigates to the real routes inside AccountTabs instead of swapping local state.
  const handleTabPress = (route: 'UserProfile' | 'Wallet' | 'MyOrders', tabName: string) => {
    if (!isLoggedIn) {
      setSelectedTab(tabName);
      setShowLoginCard(true);
      return;
    }
    router.push(`/Account/AccountTabs/${route}`);
  };

  const handleProfilePress = () => handleTabPress('UserProfile', 'Profile');
  const handleWalletPress = () => handleTabPress('Wallet', 'Wallet');
  const handleOrdersPress = () => handleTabPress('MyOrders', 'Orders');

  const clearAllSession = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('signOut error:', e);
    }

    try {
      await storage.removeItem(CACHE_KEY);
    } catch (e) {
      console.error('cache clear error:', e);
    }

    try {
      if (typeof localStorage !== 'undefined') {
        Object.keys(localStorage)
          .filter((k) => k.startsWith('sb-'))
          .forEach((k) => localStorage.removeItem(k));
      }
    } catch (e) {
      console.error('localStorage clear error:', e);
    }

    setIsLoggedIn(false);
    resetGuestState();
    setShowLogoutModal(false);
    setLoggingOut(false);

    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleAuthAction = () => {
    if (isLoggedIn) {
      setShowLogoutModal(true);
    } else {
      router.push('/auth');
    }
  };

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.menuContainer}>

          {/* Games Card */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('/games')}
          >
            <View style={styles.menuLeftContent}>
              <View style={[styles.iconContainer, { backgroundColor: '#fcd34d' }]}>
                <Ionicons name="game-controller-outline" size={28} color="#78350f" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.menuTitle}>Games</Text>
                <Text style={styles.menuSubtitle}>
                  Play & earn rewards for your next cake order!
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <>
            {/* Profile Row */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleProfilePress}
            >
              <View style={styles.menuLeftContent}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={[styles.iconContainer, { backgroundColor: '#c4b5fd' }]}>
                    <Ionicons name="person-outline" size={28} color="#6b46c1" />
                  </View>
                )}

                <View style={styles.textContainer}>
                  <Text style={styles.menuTitle}>{userName}</Text>
                  <Text style={styles.menuSubtitle}>
                    {isLoggedIn ? userEmail : 'Sign in to personalize your experience'}
                  </Text>
                  {/* Dynamic Meta Tag to showcase active birthday/gender data contextually */}
                  {isLoggedIn && (birthday || gender) && (
                    <Text style={styles.profileMetaText}>
                      {[
                        gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : null,
                        birthday ? `Born: ${birthday}` : null
                      ].filter(Boolean).join('  •  ')}
                    </Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
            </TouchableOpacity>

            {/* Wallet Row */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleWalletPress}
            >
              <View style={styles.menuLeftContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#a5f3fc' }]}>
                  <Ionicons name="wallet-outline" size={28} color="#155e75" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuTitle}>My Wallet</Text>
                  <Text style={styles.menuSubtitle}>
                    {isLoggedIn
                      ? `KSh ${walletBalance !== null ? walletBalance.toFixed(2) : '0.00'}`
                      : 'Login to view wallet'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
            </TouchableOpacity>

            {/* My Orders Row */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={handleOrdersPress}
            >
              <View style={styles.menuLeftContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#fecaca' }]}>
                  <Ionicons name="receipt-outline" size={28} color="#991b1b" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.menuTitle}>My Orders</Text>
                  <Text style={styles.menuSubtitle}>
                    {isLoggedIn
                      ? orderCount > 0
                        ? `${orderCount} order${orderCount > 1 ? 's' : ''} placed`
                        : 'No orders placed yet'
                      : 'Login to view your orders'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
            </TouchableOpacity>

            <View style={styles.spacer} />

            {/* Login / Logout Button Row */}
            <TouchableOpacity
              style={[
                styles.menuItem,
                isLoggedIn ? styles.logoutItem : styles.loginItem,
              ]}
              activeOpacity={0.7}
              onPress={handleAuthAction}
            >
              <View style={styles.menuLeftContent}>
                <View style={[
                  styles.iconContainer,
                  isLoggedIn ? { backgroundColor: '#fee2e2' } : { backgroundColor: '#dbeafe' }
                ]}>
                  <Ionicons
                    name={isLoggedIn ? "log-out-outline" : "log-in-outline"}
                    size={28}
                    color={isLoggedIn ? "#dc2626" : "#2563eb"}
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.menuTitle,
                    isLoggedIn ? styles.logoutText : styles.loginText
                  ]}>
                    {isLoggedIn ? 'Logout' : 'Login / Sign Up'}
                  </Text>
                  <Text style={styles.menuSubtitle}>
                    {isLoggedIn ? 'Sign out of your account' : 'Access your orders and wallet'}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
            </TouchableOpacity>
          </>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <NotLoggedInCard
        visible={showLoginCard}
        onClose={() => setShowLoginCard(false)}
        autoDismiss={true}
        dismissTimeout={3000}
        tabName={selectedTab}
      />

      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.logoutOverlay}>
          <View style={styles.logoutCard}>
            <View style={styles.logoutIconCircle}>
              <Ionicons name="log-out-outline" size={30} color="#dc2626" />
            </View>
            <Text style={styles.logoutTitle}>Logout</Text>
            <Text style={styles.logoutMessage}>Are you sure you want to logout?</Text>

            <View style={styles.logoutButtonGroup}>
              <TouchableOpacity
                style={[styles.logoutButton, styles.logoutCancelButton]}
                onPress={() => setShowLogoutModal(false)}
                disabled={loggingOut}
              >
                <Text style={styles.logoutCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.logoutButton, styles.logoutConfirmButton]}
                onPress={clearAllSession}
                disabled={loggingOut}
              >
                <Text style={styles.logoutConfirmText}>
                  {loggingOut ? 'Logging out...' : 'Logout'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  menuContainer: { padding: 16, paddingTop: 20 },
  inlineLoadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { fontSize: 16, color: '#6b7280' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  menuLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 2.5,
    borderColor: '#e0e7ff',
  },
  textContainer: { flex: 1 },
  menuTitle: {
    fontSize: 17.5,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 18,
  },
  profileMetaText: {
    fontSize: 12,
    color: '#8b5cf6',
    fontWeight: '500',
    marginTop: 4,
  },
  logoutItem: { borderWidth: 1.5, borderColor: '#fecaca' },
  loginItem: { borderWidth: 1.5, borderColor: '#bfdbfe' },
  logoutText: { color: '#dc2626' },
  loginText: { color: '#2563eb' },
  spacer: { flex: 1, minHeight: 30 },
  bottomPadding: { height: 80 },
  logoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoutCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  logoutMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 22,
  },
  logoutButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCancelButton: {
    backgroundColor: '#f3f4f6',
  },
  logoutCancelText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 14,
  },
  logoutConfirmButton: {
    backgroundColor: '#dc2626',
  },
  logoutConfirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

