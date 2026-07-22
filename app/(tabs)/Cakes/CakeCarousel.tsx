import React from 'react';
import { StyleSheet, View } from 'react-native';
import Market from './MarketSection';

export default function CakesContent() {
  return (
    <View style={styles.container}>
      {/* Market Section */}
      <Market />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  }
});
