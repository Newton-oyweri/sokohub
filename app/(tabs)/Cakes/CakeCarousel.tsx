import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Market from './MarketSection';

export default function CakesContent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        What's your pick for dessert today?
      </Text>

      {/* Market Section */}
      <Market />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  title: {
    textAlign: 'center',
    color: '#7C3AED', // Purple
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
});