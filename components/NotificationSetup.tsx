// components/NotificationSetup.tsx
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';
import { Router, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

let productGridCache: any = null;
let pinnedProductsCache: any = null;

// Safeguard 1: Safe dynamic require for native-only file system
if (Platform.OS !== 'web') {
  const { File, Paths } = require('expo-file-system');
  productGridCache = new File(Paths.cache, 'product_grid_cache.json');
  pinnedProductsCache = new File(Paths.cache, 'pinned_products_cache.json');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function NotificationSetup() {
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Safeguard 2: Exit early on Web to completely isolate native logic
    if (Platform.OS === 'web') return;

    // 1. Force prompt check on app launch regardless of login state
    initPushNotifications();

    // 2. React to auth state changes to map tokens on login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        registerForPushNotifications(session.user.id);
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      routeFromNotificationData(router, response.notification.request.content.data);
    });

    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        routeFromNotificationData(router, response.notification.request.content.data);
      }
    });

    return () => {
      subscription.unsubscribe();
      responseListener.current?.remove();
    };
  }, []);

  const initPushNotifications = async () => {
    if (Platform.OS === 'web') return;
    const { data: { session } } = await supabase.auth.getSession();
    await registerForPushNotifications(session?.user?.id);
  };

  const registerForPushNotifications = async (userId?: string) => {
    if (Platform.OS === 'web') return;

    try {
      // Set Android Channel FIRST (Required for Android 13+ permission prompts)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6b46c1',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permissions denied.');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '41c96e3f-d6b2-49fd-bccc-323ce431dcfb',
      });

      const token = tokenData.data;

      // Upsert token to user profile if authenticated
      if (token && userId) {
        await supabase
          .from('profiles')
          .update({ expo_push_token: token })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error registering push notifications:', error);
    }
  };

  return null;
}

export async function routeFromNotificationData(router: Router, data: any) {
  if (Platform.OS === 'web') {
    router.push("/notifications");
    return;
  }

  if (!data) {
    router.push("/notifications");
    return;
  }

  if (data.status === 'new_product' || data.productId) {
    try {
      let matchedProduct: any = null;
      const targetId = data.productId;
      const targetName = data.productName;

      if (targetId && pinnedProductsCache?.exists) {
        const content = await pinnedProductsCache.text();
        const list = JSON.parse(content || '[]');
        matchedProduct = list.find((p: any) => p.id === targetId || (targetName && p.name === targetName));
      }

      if (!matchedProduct && targetId && productGridCache?.exists) {
        const content = await productGridCache.text();
        const list = JSON.parse(content || '[]');
        matchedProduct = list.find((p: any) => p.id === targetId || (targetName && p.name === targetName));
      }

      if (!matchedProduct && (targetId || targetName)) {
        let query = supabase.from('products').select('*');

        if (targetId) {
          query = query.eq('id', targetId);
        } else {
          query = query.ilike('name', targetName);
        }

        const { data: serverProduct } = await query.limit(1).maybeSingle();
        if (serverProduct) matchedProduct = serverProduct;
      }

      if (matchedProduct) {
        router.push({
          pathname: '../order',
          params: {
            id: matchedProduct.id,
            name: matchedProduct.name,
            price: (matchedProduct.price || 0).toString(),
            seller_id: matchedProduct.seller_id || '',
            description: matchedProduct.description || 'Delicious treat',
            image_urls: JSON.stringify(matchedProduct.image_urls || null),
            post_type: matchedProduct.post_type || 'sale',
          }
        });
        return;
      }
    } catch (err) {
      console.log('Error deep-linking notification to order screen:', err);
    }
  }

  router.push("/notifications");
}

