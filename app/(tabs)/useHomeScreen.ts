import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Animated, BackHandler } from 'react-native';
import { supabase } from '../../lib/supabase';

export type CategoryKey =
  | 'bakery'
  | 'flowers'
  | 'groceries'
  | 'fashion'
  | 'electronics'
  | 'services';

export const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: 'bakery', label: 'Cakes & Bakery'},
  { key: 'flowers', label: 'Flowers & Gifts'},
  { key: 'groceries', label: 'Groceries'},
  { key: 'fashion', label: 'Fashion'},
  { key: 'electronics', label: 'Electronics'},
  { key: 'services', label: 'Services'},
];

export function useHomeScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<'cakes' | 'account'>(
    tab === 'account' ? 'account' : 'cakes'
  );

  // Active category within the Shop tab. Defaults to Bakery since
  // that's the only category with real content right now.
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('bakery');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Guest User');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const shakeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleShopPress = () => setActiveTab('cakes');
  const handleAccountPress = () => setActiveTab('account');
  const handleCategoryPress = (key: CategoryKey) => setActiveCategory(key);

  // --- Smart hardware back button ---
  // On Account tab: back returns to Shop instead of leaving the screen/app.
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (activeTab === 'account') {
          setActiveTab('cakes');
          return true;
        }
        return false;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [activeTab])
  );

  // --- Profile fetch ---
  const fetchProfileDetails = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setUserName(data.full_name?.trim() || 'New User');
        setAvatarUrl(data.avatar_url || null);
      }
    } catch (err) {
      console.log('Error fetching greeting assets:', err);
    }
  }, []);

  // --- Unread count fetch ---
  const fetchUnreadCount = useCallback(async (userId: string) => {
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
  }, []);

  // --- Auth lifecycle ---
  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        fetchProfileDetails(session.user.id);
        fetchUnreadCount(session.user.id);
      }
    };

    checkUserSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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
  }, [fetchProfileDetails, fetchUnreadCount]);

  // --- Realtime notifications subscription ---
  useEffect(() => {
    if (!isLoggedIn) return;

    let channel: any = null;

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const userId = session.user.id;

      channel = supabase
        .channel(`realtime-unread-${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
          () => fetchUnreadCount(userId)
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [isLoggedIn, fetchUnreadCount]);

  // --- Bell shake animation ---
  useEffect(() => {
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

    if (shakeIntervalRef.current) {
      clearInterval(shakeIntervalRef.current);
      shakeIntervalRef.current = null;
    }

    if (unreadCount > 0) {
      triggerBellShake();
      shakeIntervalRef.current = setInterval(triggerBellShake, 4000);
    } else {
      shakeAnimation.setValue(0);
    }

    return () => {
      if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current);
    };
  }, [unreadCount, shakeAnimation]);

  const bellRotation = shakeAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  const greetingOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return {
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
  };
}
