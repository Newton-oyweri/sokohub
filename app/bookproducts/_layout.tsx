import { Stack } from 'expo-router';

export default function BookProductsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "booking for an event",
        headerTintColor: '#6b46c1',
        headerStyle: { backgroundColor: '#f8f4ff' },
      }}
    >
      <Stack.Screen name="index" options={{ title: "book products" }} />
    </Stack>
  );
}