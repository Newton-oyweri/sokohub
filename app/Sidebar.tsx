import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.5;

export function Options({ onClose }: { onClose: () => void }) {
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';

  const options = [
    { name: 'Maize', icon: 'leaf', href: '/(tabs)/home/Maize' },
    { name: 'Wheat', icon: 'pagelines', href: '/(tabs)/home/Wheat' },
    { name: 'Rice', icon: 'leaf', href: '/(tabs)/home/Rice' },
    { name: 'Beans', icon: 'pagelines', href: '/(tabs)/home/Beans' },
    { name: 'Coffee', icon: 'coffee', href: '/(tabs)/home/Coffee' },
    { name: 'Tea', icon: 'coffee', href: '/(tabs)/home/Tea' },
  ];

  return (
    <View>
      {options.map((item) => (
        <TouchableOpacity
          key={item.name}
          onPress={() => {
            router.push(item.href as any);
            onClose();
          }}
          style={[
            styles.option,

            {
              
              borderColor: Colors[colorScheme].border,
            },
          ]}
        >
          <FontAwesome
            name={item.icon as any}
            size={20}
            color={Colors[colorScheme].text}
          />

          <Text
            style={{
              color: Colors[colorScheme].text,
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function Sidebar({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';

  const translateX = useRef(
    new Animated.Value(-SIDEBAR_WIDTH)
  ).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -SIDEBAR_WIDTH,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
    >
      <View style={styles.overlay}>
        
        {/* Backdrop */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
        />

        {/* Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              backgroundColor:
                Colors[colorScheme].background,
              borderColor:
                Colors[colorScheme].border,
              transform: [{ translateX }],
            },
          ]}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 20,
              color: Colors[colorScheme].text,
            }}
          >
            Commodities
          </Text>

          <Options onClose={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    paddingHorizontal: 20,
    paddingTop: 60,
    borderRightWidth: 1,
    
  },

  option: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',

    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
});