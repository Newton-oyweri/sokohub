import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import Sidebar from './Sidebar';

export function ToggleSidebar() {
  const [visible, setVisible] = React.useState(false);
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';

  return (
    <>
      {/* Menu Icon Button */}
      <Pressable
        onPress={() => setVisible(true)}
        style={styles.iconButton}
      >
        <FontAwesome
          name="bars"   // hamburger menu icon
          size={22}
          color={Colors[colorScheme].text}
        />
      </Pressable>

      <Sidebar
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </>
  );
}

export default function TopBar() {
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';

  return (
    <Pressable
      style={[
        styles.topbar,
        { borderColor: Colors[colorScheme].border },
      ]}
    >
      <ToggleSidebar />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topbar: {
    height: 60,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
  },

  iconButton: {
    position: 'absolute',
    left: 16,
    bottom: 0,
    padding: 6,
  },
});