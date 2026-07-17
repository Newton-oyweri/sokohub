import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DownloadAction() {
  const [visible, setVisible] = useState(true);

  // Only ever show this on web — never on native mobile
  if (Platform.OS !== 'web' || !visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        📲 Get the Wonderbakes app for the best experience
      </Text>

      <TouchableOpacity
        onPress={() => setVisible(false)}
        style={styles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: 10,
    paddingHorizontal: 40,

    backgroundColor: '#B53737',
  },

  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  closeButton: {
    position: 'absolute',
    right: 12,
  },
});
