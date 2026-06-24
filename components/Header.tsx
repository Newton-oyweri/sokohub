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
        source={require('../assets/json/cake.json')}
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
    left: 0, // Allows text alignment formatting blocks to compute safely

    // Align content explicitly to the top right side
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