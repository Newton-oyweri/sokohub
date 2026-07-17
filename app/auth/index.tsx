import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Track which field is focused so we can swap the border color instead of
  // showing the browser's default black/blue outline on web.
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateFields = (): string | null => {
    if (!email || !password) return 'Please fill in all fields';
    if (!isLogin) {
      if (!confirmPassword) return 'Please fill in all fields';
      if (password.length < 6) return 'Password must be at least 6 characters';
      if (password !== confirmPassword) return 'Passwords do not match';
    }
    return null;
  };

  const handleAuth = async () => {
    const error = validateFields();
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
      }

      if (result.error) throw result.error;

      if (result.data.user) {
        router.back();
      }
    } catch (error: any) {
      Alert.alert(isLogin ? 'Login Failed' : 'Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'sokohub://',
      });

      if (error) throw error;

      Alert.alert(
        'Reset Email Sent',
        'Please check your email (including spam folder) for the reset link.'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  // Helper to combine the base input style with a focus-state border color,
  // and strip the browser's default focus outline (web only).
  const inputContainerStyle = (fieldName: string) => [
    styles.inputContainer,
    focusedField === fieldName && styles.inputContainerFocused,
  ];

  return (
    <View style={styles.rootWrapper}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="restaurant-outline" size={60} color="#6b46c1" />
            </View>
            <Text style={styles.title}>Wonderbakes</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={inputContainerStyle('email')}>
              <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={inputContainerStyle('password')}>
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            {!isLogin && (
              <View style={inputContainerStyle('confirmPassword')}>
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
              </View>
            )}

            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isLogin ? 'Login' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </Text>
              <TouchableOpacity onPress={toggleMode} disabled={loading}>
                <Text style={styles.toggleLink}>
                  {isLogin ? ' Sign Up' : ' Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootWrapper: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 56,
  },
  inputContainerFocused: {
    borderColor: '#6b46c1',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    height: '100%',
    // @ts-ignore - outlineStyle is a react-native-web-only style prop that
    // removes the browser's default black/blue focus ring on <input>.
    outlineStyle: 'none',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6b46c1',
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#6b46c1',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  toggleText: {
    fontSize: 15,
    color: '#6b7280',
  },
  toggleLink: {
    fontSize: 15,
    color: '#6b46c1',
    fontWeight: '600',
  },
});
