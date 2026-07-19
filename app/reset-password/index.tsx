import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fallbackUrl?: string; hash?: string }>();
  
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    const initializeResetSession = async () => {
      const url = params.fallbackUrl || '';
      const hashPart = params.hash || '';

      // 1. Handle expired link or errors passed through URL
      if (url.includes('error=')) {
        if (url.includes('otp_expired') || url.includes('expired')) {
          Alert.alert('Link Expired', 'This password reset link has expired. Please request a new one.', [
            { text: 'OK', onPress: () => router.replace('/auth') }
          ]);
          return;
        }
      }

      // 2. Extract tokens from hash parameters
      let accessToken = null;
      let refreshToken = null;

      if (hashPart) {
        const searchParams = new URLSearchParams(hashPart);
        accessToken = searchParams.get('access_token');
        refreshToken = searchParams.get('refresh_token');
      }

      // 3. Authenticate session with Supabase using recovery tokens
      if (accessToken && refreshToken) {
        try {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) throw sessionError;
          setIsSessionReady(true);
        } catch (sessionErr: any) {
          Alert.alert('Authentication Error', sessionErr.message || 'Failed to map recovery tokens.', [
            { text: 'OK', onPress: () => router.replace('/auth') }
          ]);
        }
      } else {
        if (!url.includes('error=')) {
          Alert.alert('Invalid Link', 'This password reset link appears malformed or missing session keys.', [
            { text: 'OK', onPress: () => router.replace('/auth') }
          ]);
        }
      }
    };

    initializeResetSession();
  }, [params]);

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

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Please enter your new password below:</Text>

        <TextInput
          style={styles.input}
          placeholder="Minimum 6 characters"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          editable={!updating && isSessionReady}
        />

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.replace('/auth')}
            disabled={updating}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handlePasswordSubmit}
            disabled={updating || !isSessionReady}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 28,
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
    marginBottom: 24,
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
});

