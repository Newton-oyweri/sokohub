import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import LottieView from 'lottie-react-native';

const { height } = Dimensions.get('window');

const STATUS_BAR_HEIGHT =
  Platform.OS === 'ios'
    ? 48
    : StatusBar.currentHeight || 0;

export const HEADER_HEIGHT =
  height * 0.35 + STATUS_BAR_HEIGHT;

export default function Header() {
  return (
    <View
      style={[
        styles.header,
        { height: HEADER_HEIGHT },
      ]}
    >
      {/* Animated Background */}
      <LottieView
        source={require('../assets/json/Fireworks.json')}
        autoPlay
        loop
        resizeMode="cover"
        style={StyleSheet.absoluteFillObject}
      />

      {/* Cake Decoration */}
      <Image
        source={require('../assets/images/transparentcake.png')}
        resizeMode="contain"
        style={styles.cake}
      />

      {/* Soft overlay for text readability */}
      <View style={styles.overlay} />

      {/* Branding */}
      <View style={styles.headerOverlay}>
        <Text style={styles.title}>Wonderland</Text>
        <Text style={styles.subtitle}>
          CAKES & MORE
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
    flex: 1,
    justifyContent: 'flex-end',

    paddingHorizontal: 24,
    paddingBottom: '20%',

    zIndex: 2,
  },

  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',

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

    color: 'rgba(255,255,255,0.85)',

    letterSpacing: 2,
  },
});