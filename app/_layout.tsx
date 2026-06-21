import React from 'react';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar 
        barStyle="dark-content" 
        translucent={true} 
        backgroundColor="transparent" 
      />
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Main Application view containing your Tab view */}
      <Stack.Screen name="(tabs)" />       
    </Stack>
    </GestureHandlerRootView>
  );
}