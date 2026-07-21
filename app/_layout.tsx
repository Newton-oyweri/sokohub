import React, { useEffect } from 'react';
import {
  StatusBar,
  Linking,
  View,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Stack, useRouter, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const WIDE_LAYOUT_BREAKPOINT = 900;
const APP_COLUMN_WIDTH = 480;

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWideLayout = width >= WIDE_LAYOUT_BREAKPOINT;

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  useEffect(() => {
    const handleDeepLink = async () => {
      const url = await Linking.getInitialURL();
      if (url) handleUrl(url);
    };

    const handleUrl = (url: string) => {
      // If it's a password recovery link, route the user to the dedicated screen
      if (url.includes('/auth/v1/verify') || url.includes('type=recovery') || url.includes('error=')) {
        const hashPart = url.split('#')[1] || url.split('?')[1];

        // Forward to the reset-password screen along with the URL fragment payload
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

  const appContent = (
    <>
      <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="reset-password" />
      </Stack>
    </>
  );

  return (
    <SafeAreaProvider>
      {isWideLayout ? (
        <View style={styles.wideRoot}>
          <View style={styles.brandingPanel} />
          <View style={styles.wideAppColumn}>
            {appContent}
          </View>
          <View style={styles.brandingPanel} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {appContent}
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  wideRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  brandingPanel: {
    flex: 1,
  },
  wideAppColumn: {
    width: APP_COLUMN_WIDTH,
    flex: 0,
  },
});
