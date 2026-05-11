import { useColorScheme } from '@/components/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, Text } from 'react-native';

import Sidebar from '@/app/Sidebar';


export function ToggleSidebar() {
  const [visible, setVisible] = React.useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={{
          backgroundColor: "#2563eb",
          padding: 15,
          borderRadius: 50,
        }}
      >
        <Text style={{ color: "white" }}>
          Open Sidebar
        </Text>
      </Pressable>

      <Sidebar
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </>
  );
}


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  

  return (
    <>    
    <Tabs
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="home"
          options={{
          title: 'Market',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </Tabs>
  
    </>
  );
}
