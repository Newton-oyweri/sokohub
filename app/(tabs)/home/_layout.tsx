import { Stack } from 'expo-router';
import Topbar from '../../HomeBar';

export default function HomeStack() {
  return (
    <> 
    <Topbar /> 
    <Stack>
      <Stack.Screen name="index" 

        options={{
          headerShown: false,
        }} 
      />
      <Stack.Screen name="Maize" 
      
         options={{
          headerShown: false,
        }} 
        />
        <Stack.Screen name="Wheat"
         options={{
          headerShown: false,
        }} 
        />
        <Stack.Screen name="Rice"
         options={{
          headerShown: false,
        }} 
        />
        <Stack.Screen name="Beans"
         options={{
          headerShown: false,
        }} 
        />
        <Stack.Screen name="Coffee"
         options={{
          headerShown: false,
        }} 
        />
        <Stack.Screen name="Tea"
         options={{
          headerShown: false,
        }} 
        />
        
    </Stack>
    </>
  );
}
  