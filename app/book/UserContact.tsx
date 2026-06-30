import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function UserContact() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(user);

      // Fetch profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#6b46c1" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Ionicons name="person-outline" size={32} color="#94a3b8" />
          <Text style={styles.notLoggedInText}>You are not logged in</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#6b46c1" />
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#6b46c1" />
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{profile?.phone || 'Not set'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 12,
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 2,
    textAlign: 'right',
  },
  notLoggedIn: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#6b46c1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});