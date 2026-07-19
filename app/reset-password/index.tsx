import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ fallbackUrl?: string; hash?: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  
  // Custom UI notification states instead of alerts
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'error' | 'success' | null>(null);

  useEffect(() => {
    const initializeResetSession = async () => {
      let fullUrl = '';

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        fullUrl = window.location.href;
      } else {
        fullUrl = decodeURIComponent(params.fallbackUrl || '');
      }

      if (fullUrl.includes('error=')) {
        if (fullUrl.includes('otp_expired') || fullUrl.includes('expired')) {
          setFeedbackType('error');
          setFeedbackMessage('This password reset link has expired. Redirecting...');
          setTimeout(() => router.replace('/auth'), 3000);
          return;
        }
      }

      let accessToken: string | null = null;
      let refreshToken: string | null = null;
      let token: string | null = null;
      let type: string | null = null;

      const hashPart = fullUrl.split('#')[1];
      if (hashPart) {
        const hashParams = new URLSearchParams(hashPart);
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
      }

      const queryPart = fullUrl.split('?')[1];
      if (queryPart) {
        const queryParams = new URLSearchParams(queryPart);
        if (!accessToken) accessToken = queryParams.get('access_token');
        if (!refreshToken) refreshToken = queryParams.get('refresh_token');
        token = queryParams.get('token');
        type = queryParams.get('type');
      }

      try {
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          setIsSessionReady(true);
        } else if (token && type === 'recovery') {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token: token,
            type: 'recovery',
          });
          if (verifyError) throw verifyError;
          setIsSessionReady(true);
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setIsSessionReady(true);
          } else {
            setFeedbackType('error');
            setFeedbackMessage('This link appears malformed or missing session keys.');
          }
        }
      } catch (sessionErr: any) {
        setFeedbackType('error');
        setFeedbackMessage(sessionErr.message || 'Failed to map recovery tokens.');
      }
    };

    initializeResetSession();
  }, [params]);

  const handlePasswordSubmit = async () => {
    setFeedbackMessage(null);
    setFeedbackType(null);

    if (!newPassword || newPassword.length < 6) {
      setFeedbackType('error');
      setFeedbackMessage('Password must be at least 6 characters long.');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setFeedbackType('success');
      setFeedbackMessage('Your password has been changed successfully!');
      setNewPassword('');
      
      // Delay navigation slightly so the user can read the success state
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);

    } catch (err: any) {
      setFeedbackType('error');
      setFeedbackMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Please enter your new password below:</Text>

        {/* Dynamic Status Notification Banner */}
        {feedbackMessage && (
          <View style={[
            styles.banner, 
            feedbackType === 'error' ? styles.errorBanner : styles.successBanner
          ]}>
            <Text style={[
              styles.bannerText, 
              feedbackType === 'error' ? styles.errorBannerText : styles.successBannerText
            ]}>
              {feedbackMessage}
            </Text>
          </View>
        )}

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
            disabled={updating || !isSessionReady || feedbackType === 'success'}
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
    marginBottom: 20,
  },
  banner: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  successBanner: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  bannerText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorBannerText: {
    color: '#b91c1c',
  },
  successBannerText: {
    color: '#15803d',
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

