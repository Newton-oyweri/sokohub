// components/NotificationSetup.tsx
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';
import { Router, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system'; // Added for offline cache lookup upon tap

// Cache file targets matching your application schemas
const productGridCache = new File(Paths.cache, 'product_grid_cache.json');
const pinnedProductsCache = new File(Paths.cache, 'pinned_products_cache.json');

// Configure foreground notifications behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function NotificationSetup() {
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Listen to changes in user authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        registerForPushNotifications(session.user.id);
      }
    });

    // Fires when the user TAPS a notification while the app is running
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      routeFromNotificationData(router, response.notification.request.content.data);
    });

    // Handles the case where the app was fully closed and the tap LAUNCHED it
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

  const registerForPushNotifications = async (userId: string) => {
    try {
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

      // Fetch token tied directly to your EAS Project ID
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '41c96e3f-d6b2-49fd-bccc-323ce431dcfb',
      });

      const token = tokenData.data;

      if (token) {
        // Sync token back to profiles
        await supabase
          .from('profiles')
          .update({ expo_push_token: token })
          .eq('id', userId);
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6b46c1',
        });
      }
    } catch (error) {
      console.error('Error handling push registration:', error);
    }
  };

  return null; // This component runs entirely in the background
}

// Rewritten routing handler that deep-links directly into the order section if product data exists
export async function routeFromNotificationData(router: Router, data: any) {
  if (!data) {
    router.push("/notifications");
    return;
  }

  // Intercept new product updates launched from system trays or notification cards
  if (data.status === 'new_product' || data.productId) {
    try {
      let matchedProduct: any = null;
      const targetId = data.productId;
      const targetName = data.productName; // Helpful fallback query parameter matching if sent via payload

      // 1. Search the Weekly Specials cache file
      if (targetId && pinnedProductsCache.exists) {
        const content = await pinnedProductsCache.text();
        const list = JSON.parse(content || '[]');
        matchedProduct = list.find((p: any) => p.id === targetId || (targetName && p.name === targetName));
      }

      // 2. Search the Main Catalog item grid cache file
      if (!matchedProduct && targetId && productGridCache.exists) {
        const content = await productGridCache.text();
        const list = JSON.parse(content || '[]');
        matchedProduct = list.find((p: any) => p.id === targetId || (targetName && p.name === targetName));
      }

      // 3. Remote Server query fallback if not indexed locally yet
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

      // Direct navigation transfer with clean argument mapping parameters string-coerced
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

  // Fallback default routing point if notification belongs to administrative state/status changes
  router.push("/notifications");
}