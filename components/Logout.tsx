import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Platform,
    Text,
    TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';

export const useLogout = () => {
  const router = useRouter();

  const clearWebStorage = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.clear();
        sessionStorage.clear();

        // Clear Supabase specific keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Clear cookies
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.split('=');
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        console.log('✅ All web storage cleared');
      } catch (e) {
        console.error('Failed to clear storage:', e);
      }
    }
  };

  const performLogout = async (): Promise<{ success: boolean; error?: Error }> => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear storage
      clearWebStorage();

      // Force full reload on web
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        console.log('🔄 Forcing full page reload...');
        setTimeout(() => {
          window.location.href = '/';
        }, 300);
        return { success: true };
      } 
      
      // For mobile
      router.push('/');
      return { success: true };

    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Logout failed') 
      };
    }
  };

  const showLogoutConfirmation = (onSuccess?: () => void) => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await performLogout();
            if (result.success) {
              onSuccess?.();
            } else if (result.error) {
              Alert.alert('Error', result.error.message);
            }
          },
        },
      ]
    );
  };

  return {
    performLogout,
    showLogoutConfirmation,
    clearWebStorage,
  };
};

// Optional Logout Button Component
interface LogoutButtonProps {
  children?: React.ReactNode;
  onLogoutSuccess?: () => void;
  className?: string;
  style?: any;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  children, 
  onLogoutSuccess,
  className,
  style 
}) => {
  const { showLogoutConfirmation } = useLogout();

  const handlePress = () => {
    showLogoutConfirmation(onLogoutSuccess);
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className={className}
      style={style}
    >
      {children || <Text>Logout</Text>}
    </TouchableOpacity>
  );
};

export default {
  useLogout,
  LogoutButton,
};