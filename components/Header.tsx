import LottieView from 'lottie-react-native';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

// Fallback value for anything importing HEADER_HEIGHT at module scope
// (e.g. index.tsx uses it for layout before Header itself mounts).
// This won't be perfectly accurate in SSR/static export, but avoids
// a 0-height header and matches native/client behavior once hydrated.
const { height: initialHeight } = Dimensions.get('window');

const STATUS_BAR_HEIGHT =
  Platform.OS === 'ios'
    ? 48
    : StatusBar.currentHeight || 0;

export const HEADER_HEIGHT =
  (initialHeight || 800) * 0.35 + STATUS_BAR_HEIGHT;

// Map of 7 days of the week to their respective JSON animations
const ANIMATION_URLS: Record<number, string> = {
  0: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/cake.json',      // Sunday
  1: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/pizza.json',     // Monday
  2: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/birthday.json',  // Tuesday
  3: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/bunnie.json',    // Wednesday
  4: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/Buynow.json',    // Thursday
  5: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/Fireworks.json', // Friday
  6: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/couple.json',    // Saturday
};

// Get the current day index (0 = Sunday, 1 = Monday, etc.)
const currentDay = new Date().getDay();
const DYNAMIC_JSON_URL = ANIMATION_URLS[currentDay];

export default function Header() {
  // Use live window dimensions per-render instead of the module-level
  // Dimensions.get('window') snapshot, which can be 0x0 during static
  // pre-rendering (no real browser window at build time).
  const { height } = useWindowDimensions();
  const headerHeight = (height || initialHeight || 800) * 0.35 + STATUS_BAR_HEIGHT;

  // Only mount LottieView after client-side hydration. Its remote-JSON
  // web support is unreliable during Node-based static export and can
  // silently break the whole render pass.
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <View
      style={[
        styles.header,
        { height: headerHeight },
      ]}
    >
      {/* Animated Background - Dynamically matches the day of the week */}
      {mounted && (
        <LottieView
          source={{ uri: DYNAMIC_JSON_URL }}
          autoPlay
          loop
          resizeMode="cover"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}
        />
      )}

      {/* Cake Decoration - Maintained Local */}
      <Image
        source={require('../assets/images/transparentcake.png')}
        resizeMode="contain"
        style={styles.cake}
      />

      {/* Soft overlay for text readability */}
      <View style={styles.overlay} />

      {/* Branding - Positioned Top Right Side */}
      <View style={[styles.headerOverlay, { paddingTop: STATUS_BAR_HEIGHT + 16 }]}>
        <Text style={styles.title}>Wonderbakes</Text>
        <Text style={styles.subtitle}>
          Your everyday dessert!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    overflow: 'hidden',
  },

  cake: {
    position: 'absolute',

    right: -15,
    bottom: 0,

    width: 240,
    height: 300,

    zIndex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(181, 55, 55, 0.26)',
  },

  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,

    alignItems: 'flex-end',
    justifyContent: 'flex-start',

    paddingHorizontal: 24,

    zIndex: 2,
  },

  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'right',

    letterSpacing: -1,

    textShadowColor: 'rgba(255, 174, 0, 0.25)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 12,
  },

  subtitle: {
    marginTop: 4,

    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',

    color: 'rgba(255,255,255,0.85)',

    letterSpacing: 2,
  },
});
