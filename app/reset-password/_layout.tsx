import React from 'react';
import { Stack } from 'expo-router';

export default function ResetPasswordLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{
          // Optional: Ensures presentation looks good on iOS if triggered via deep link
          presentation: 'card', 
        }}
      />
    </Stack>
  );
}

