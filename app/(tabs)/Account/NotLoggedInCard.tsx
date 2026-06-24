import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface NotLoggedInCardProps {
  visible: boolean;
  onClose: () => void;
  autoDismiss?: boolean;
  dismissTimeout?: number;
  tabName?: string;
}

export default function NotLoggedInCard({
  visible,
  onClose,
  autoDismiss = true,
  dismissTimeout = 3000,
  tabName = 'this',
}: NotLoggedInCardProps) {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (autoDismiss) {
        timeoutRef.current = setTimeout(() => {
          handleClose();
        }, dismissTimeout);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleLoginPress = () => {
    handleClose();
    router.push('/auth');
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.cardContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.card}>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={22} color="#6b7280" />
                </TouchableOpacity>

                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons name="lock-closed" size={32} color="#6b46c1" />
                </View>

                {/* Title & Message */}
                <Text style={styles.title}>Login Required</Text>
                <Text style={styles.message}>
                  Please log in to access the {tabName} tab.
                </Text>

                {/* Buttons */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLoginPress}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-in-outline" size={18} color="#fff" />
                  <Text style={styles.loginButtonText}>Login Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.guestButtonText}>Continue as Guest</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 340,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b46c1',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  guestButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
});