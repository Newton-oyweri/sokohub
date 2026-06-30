import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import UserProfile from './AccountTabs/UserProfile';
import Wallet from './AccountTabs/Wallet';
import MyOrders from './AccountTabs/MyOrders';
import { useRouter } from 'expo-router';
import NotLoggedInCard from './NotLoggedInCard';

export default function AccountContent() {
  const router = useRouter();
  
  const [currentView, setCurrentView] = useState<'menu' | 'profile' | 'wallet' | 'orders'>('menu');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [selectedTab, setSelectedTab] = useState('');

  const [userName, setUserName] = useState<string>('New User');
  const [userEmail, setUserEmail] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (data) {
        setUserName(data.full_name?.trim() || 'Wonderland Customer');
        setAvatarUrl(data.avatar_url || null);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: user.user_metadata?.full_name || 'Wonderland Customer',
            email: user.email,
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      // Production handling
    }
  }, []);

  const fetchWalletBalance = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setWalletBalance(data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setWalletBalance(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && mounted) {
          setIsLoggedIn(true);
          setUserEmail(session.user.email || '');
          await fetchUserProfile(session.user.id);
          await fetchWalletBalance(session.user.id);
        } else if (mounted) {
          setIsLoggedIn(false);
          resetGuestState();
        }
      } catch (error) {
        if (mounted) setIsLoggedIn(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session) {
          setIsLoggedIn(true);
          setUserEmail(session.user.email || '');
          await fetchUserProfile(session.user.id);
          await fetchWalletBalance(session.user.id);
        } else {
          setIsLoggedIn(false);
          resetGuestState();
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile, fetchWalletBalance]);

  const resetGuestState = () => {
    setUserName('Guest User');
    setUserEmail('');
    setAvatarUrl(null);
    setWalletBalance(null);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserEmail(session.user.email || '');
      await fetchUserProfile(session.user.id);
      await fetchWalletBalance(session.user.id);
    }
    setRefreshing(false);
  };

  const handleTabPress = (tab: 'profile' | 'wallet' | 'orders', tabName: string) => {
    if (!isLoggedIn) {
      setSelectedTab(tabName);
      setShowLoginCard(true);
      return;
    }
    setCurrentView(tab);
  };

  const handleProfilePress = () => handleTabPress('profile', 'Profile');
  const handleWalletPress = () => handleTabPress('wallet', 'Wallet');
  const handleOrdersPress = () => handleTabPress('orders', 'Orders');

  const handleBackToMenu = async () => {
    setCurrentView('menu');
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchUserProfile(session.user.id);
      await fetchWalletBalance(session.user.id);
    }
  };

  const handleAuthAction = async () => {
    if (isLoggedIn) {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) Alert.alert('Error', error.message);
          },
        },
      ]);
    } else {
      router.push('/auth');
    }
  };

  if (currentView === 'profile') return <UserProfile onBack={handleBackToMenu} />;
  if (currentView === 'wallet') return <Wallet onBack={handleBackToMenu} />;
  if (currentView === 'orders') return <MyOrders onBack={handleBackToMenu} />;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your account...</Text>
      </View>
    );
  }

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

          {/* route to games page */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => router.push('../../games')}
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
              <View style={[styles.iconContainer, { backgroundColor: '#67e8f9' }]}>
                <Ionicons name="cart-outline" size={28} color="#155e75" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.menuTitle}>My Orders</Text>
                <Text style={styles.menuSubtitle}>
                  {isLoggedIn ? 'Recent order history, 10 orders...' : 'Login to view orders'}
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

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* Login Required Card */}
      <NotLoggedInCard
        visible={showLoginCard}
        onClose={() => setShowLoginCard(false)}
        autoDismiss={true}
        dismissTimeout={3000}
        tabName={selectedTab}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  menuContainer: { padding: 16, paddingTop: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
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
  logoutItem: { borderWidth: 1.5, borderColor: '#fecaca' },
  loginItem: { borderWidth: 1.5, borderColor: '#bfdbfe' },
  logoutText: { color: '#dc2626' },
  loginText: { color: '#2563eb' },
  spacer: { flex: 1, minHeight: 30 },
  bottomPadding: { height: 80 },
});