import { Stack } from 'expo-router';

export default function LocationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: "choose location",
        headerTintColor: '#6b46c1',
        headerStyle: { backgroundColor: '#f8f4ff' },
      }}
    >
      <Stack.Screen name="index" options={{ title: "book" }} />
    </Stack>
  );
}
