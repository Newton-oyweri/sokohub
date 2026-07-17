import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SLIDES = [
  { icon: 'flash-outline', iconSet: 'ion', text: 'Shop faster on the app' },
  { icon: 'truck-fast-outline', iconSet: 'mci', text: 'Track deliveries live' },
  { icon: 'cake-variant', iconSet: 'mci', text: 'Enjoy your favorites, fresh' },
] as const;

const SLIDE_DURATION = 3000;

export default function DownloadAction() {
  const [visible, setVisible] = useState(true);
  const [index, setIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      Animated.timing(translateX, {
        toValue: -24,
        duration: 220,
        useNativeDriver: true,
      }).start(() => {
        setIndex((prev) => (prev + 1) % SLIDES.length);
        translateX.setValue(24);
        Animated.timing(translateX, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [visible]);

  // Only ever show this on web — never on native mobile
  if (Platform.OS !== 'web' || !visible) {
    return null;
  }

  const slide = SLIDES[index];

  return (
    <View style={styles.container}>
      <View style={styles.downloadBox}>
        <Ionicons name="download-outline" size={18} color="#fff" />
        <Text style={styles.downloadBoxText}>Download Now</Text>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.iconBadge}>
          {slide.iconSet === 'ion' ? (
            <Ionicons name={slide.icon as any} size={14} color="#6b46c1" />
          ) : (
            <MaterialCommunityIcons name={slide.icon as any} size={14} color="#6b46c1" />
          )}
        </View>

        <Animated.View style={{ transform: [{ translateX }] }}>
          <Text style={styles.text} numberOfLines={1}>
            {slide.text}
          </Text>
        </Animated.View>
      </View>

      <TouchableOpacity
        onPress={() => setVisible(false)}
        style={styles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={26} color="#94a3b8" />
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
    gap: 16,

    paddingVertical: 10,
    paddingHorizontal: 40,

    backgroundColor: '#faf5ff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  downloadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,

    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,

    backgroundColor: '#6b46c1',

    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },

  downloadBoxText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },

  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
    flex: 1,
  },

  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#fce7f3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '700',
  },

  closeButton: {
    marginLeft: 4,
  },
});