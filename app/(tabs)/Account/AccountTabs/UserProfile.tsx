import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../../../lib/supabase';

const AVATARS = [
  { id: 'male', url: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/profile_avatar/maleavatar.jfif' },
  { id: 'female', url: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/profile_avatar/femaleavatar.png' }
];

export default function UserProfile() {
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(AVATARS[0].url);
  const [isChoosingAvatar, setIsChoosingAvatar] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        Alert.alert('Error', 'Please log in to manage your profile.');
        router.back();
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setName(data.full_name || '');
        setPhone(data.phone || '');
        setAvatarUrl(data.avatar_url || AVATARS[0].url);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId || !name.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: name.trim(),
          phone: phone.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditing(false);
      setIsChoosingAvatar(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChoosingAvatar(false);
    fetchUserProfile();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6b46c1" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.profileSection}>
          {isEditing && isChoosingAvatar ? (
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorTitle}>Choose Avatar</Text>
              <View style={styles.avatarGrid}>
                {AVATARS.map((avatar) => (
                  <TouchableOpacity 
                    key={avatar.id} 
                    onPress={() => {
                      setAvatarUrl(avatar.url);
                      setIsChoosingAvatar(false);
                    }}
                    style={[
                      styles.gridAvatarWrapper, 
                      avatarUrl === avatar.url && styles.selectedGridAvatar
                    ]}
                  >
                    <Image source={{ uri: avatar.url }} style={styles.gridAvatarImage} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.avatarContainer} 
              onPress={() => isEditing && setIsChoosingAvatar(true)}
              disabled={!isEditing}
            >
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              {isEditing && (
                <View style={styles.editBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          )}
          
          {!isChoosingAvatar && (
            <>
              <Text style={styles.userName}>{name.trim() || 'New User'}</Text>
              {isEditing && (
                <Text style={styles.changeHint}>Tap avatar to change</Text>
              )}
            </>
          )}
        </View>

        {/* Profile Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#94a3b8"
                editable={!isSaving}
              />
            ) : (
              <Text style={styles.value}>{name || 'Not set'}</Text>
            )}
          </View>

          <View style={[styles.field, styles.lastField]}>
            <Text style={styles.label}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
                placeholderTextColor="#94a3b8"
                editable={!isSaving}
              />
            ) : (
              <Text style={styles.value}>{phone || 'Not set'}</Text>
            )}
          </View>
        </View>

        {/* Actions */}
        {isEditing ? (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.cancelBtn]} 
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.saveBtn]} 
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4ff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f4ff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 4,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
    paddingTop: 2,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#6b46c1',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  changeHint: {
    fontSize: 13,
    color: '#6b46c1',
    fontWeight: '500',
    marginTop: 4,
  },
  selectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ede9fe',
    marginBottom: 12,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b46c1',
    marginBottom: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  gridAvatarWrapper: {
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 44,
    padding: 2,
  },
  selectedGridAvatar: {
    borderColor: '#6b46c1',
  },
  gridAvatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  field: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastField: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    backgroundColor: '#f8f6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ede9fe',
    marginTop: 2,
  },
  editBtn: {
    backgroundColor: '#6b46c1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 17,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#10b981',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});