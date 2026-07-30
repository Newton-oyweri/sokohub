import React, { useEffect } from 'react';
import {
  StatusBar,
  Linking,
  View,
} from 'react-native';
import { Stack, useRouter, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NotificationSetup from '@/components/NotificationSetup';
import { configureNotifications } from "@/lib/notifications";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    configureNotifications();
    supabase.auth.getSession();
  }, []);

  useEffect(() => {
    const handleDeepLink = async () => {
      const url = await Linking.getInitialURL();
      if (url) handleUrl(url);
    };

    const handleUrl = (url: string) => {
      if (url.includes('/auth/v1/verify') || url.includes('type=recovery') || url.includes('error=')) {
        const hashPart = url.split('#')[1] || url.split('?')[1];

        router.replace({
          pathname: '/reset-password',
          params: { fallbackUrl: url, hash: hashPart }
        });
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    handleDeepLink();

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />

        {/* Global setup component mounted */}
        <NotificationSetup />

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="reset-password" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}
