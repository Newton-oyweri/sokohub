import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing } from 'react-native';

export default function LoadingScreen() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.12,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
  }, [scale]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/icon.png')}
        style={[styles.icon, { transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6C3FBF', // swap for your exact purple
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 140,
    height: 140,
  },
});
