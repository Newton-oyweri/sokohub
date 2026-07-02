// components/NotificationSetup.tsx
import { supabase } from '@/lib/supabase';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

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
  useEffect(() => {
    // Listen to changes in user authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        registerForPushNotifications(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
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