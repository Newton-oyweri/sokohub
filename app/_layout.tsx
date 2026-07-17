import React, { useEffect, useState } from 'react';
import { 
  StatusBar, 
  Linking, 
  Alert, 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Above this viewport width, the app renders as a centered phone-width
// column with a plain branded background filling the rest of the screen —
// same idea as WhatsApp Web / Instagram on desktop.
const WIDE_LAYOUT_BREAKPOINT = 900;
const APP_COLUMN_WIDTH = 480;

export default function RootLayout() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWideLayout = width >= WIDE_LAYOUT_BREAKPOINT;

  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Explicitly wakes up the Supabase auth client instance on cold boot
    // to guarantee it finishes extracting the persisted session from storage.
    supabase.auth.getSession();
  }, []);

  useEffect(() => {
    const handleDeepLink = async () => {
      const url = await Linking.getInitialURL();
      if (url) handleUrl(url);
    };

    const handleUrl = async (url: string) => {
      if (url.includes('/auth/v1/verify') || url.includes('type=recovery') || url.includes('error=')) {

        if (url.includes('error=')) {
          const hashPart = url.split('#')[1];
          if (hashPart) {
            const params = new URLSearchParams(hashPart);
            const errorCode = params.get('error_code');
            if (errorCode === 'otp_expired' || url.includes('expired')) {
              Alert.alert('Link Expired', 'This password reset link has expired. Please request a new one.', [
                { text: 'OK', onPress: () => router.replace('/auth') }
              ]);
              return;
            }
          }
        }

        let accessToken = null;
        let refreshToken = null;

        try {
          const hashPart = url.split('#')[1];
          if (hashPart) {
            const params = new URLSearchParams(hashPart);
            accessToken = params.get('access_token');
            refreshToken = params.get('refresh_token');
          }
        } catch {
          // Silent catch for parsing safety
        }

        if (accessToken && refreshToken) {
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) throw sessionError;
            setModalVisible(true);

          } catch (sessionErr: any) {
            Alert.alert('Authentication Error', sessionErr.message || 'Failed to map recovery tokens.');
          }
        } else {
          if (!url.includes('error=')) {
            Alert.alert('Invalid Link', 'This password reset link appears malformed or missing session keys.', [
              { text: 'OK', onPress: () => router.replace('/auth') }
            ]);
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    handleDeepLink();

    return () => {
      subscription.remove();
    };
  }, []);

  const handlePasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert('Success', 'Your password has been changed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            setNewPassword('');
            router.replace('/(tabs)');
          }
        }
      ]);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'An unexpected error occurred.');
    } finally {
      setUpdating(false);
    }
  };

  // The actual app — the Stack, the password-reset modal, everything.
  // This is what gets capped to phone width on wide screens.
  const appContent = (
    <>
      <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalSubtitle}>Please enter your new password below:</Text>

            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              editable={!updating}
            />

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  router.replace('/auth');
                }}
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handlePasswordSubmit}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );

  return (
    <SafeAreaProvider>
      {isWideLayout ? (
        <View style={styles.wideRoot}>
          <View style={styles.brandingPanel} />
          <View style={styles.wideAppColumn}>
            {appContent}
          </View>
          <View style={styles.brandingPanel} />
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {appContent}
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#6b46c1',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  // --- Wide layout (desktop web) styles ---
  wideRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ede9fe',
  },
  wideAppColumn: {
    width: APP_COLUMN_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  brandingPanel: {
    flex: 1,
    backgroundColor: '#ede9fe',
  },
});
