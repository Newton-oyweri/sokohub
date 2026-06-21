// app/order/_layout.tsx
import { Stack } from 'expo-router';

export default function OrderLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "order page",
        headerTintColor: '#6b46c1',
        headerStyle: { backgroundColor: '#f8f4ff' },
      }}
    >
      <Stack.Screen name="index" options={{ title: "order" }} />
    </Stack>
  );
}