import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Sidebar from '@/app/Sidebar';

export default function HomeScreen() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <View style={styles.mainContainer}>

      <View style={styles.container}>
        <Text style={styles.title}>Tab One</Text>
      </View>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
      />

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});