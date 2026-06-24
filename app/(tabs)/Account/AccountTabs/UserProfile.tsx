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
import { supabase } from '../../../../lib/supabase'; // Adjust this import path relative to your file system

// Preset Avatars from your Supabase Storage Bucket
const AVATARS = [
  { id: 'male', url: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/profile_avatar/maleavatar.jfif' },
  { id: 'female', url: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/profile_avatar/femaleavatar.png' }
];

export default function UserProfile({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();

  // Lifecycle States
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // States matching your public.profiles table schema
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(AVATARS[0].url);

  // Track if the user has triggered avatar choosing mode while editing
  const [isChoosingAvatar, setIsChoosingAvatar] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // 1. Get the current logged-in authenticated user session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        Alert.alert('Authentication Error', 'Please log in to manage your profile.');
        onBack();
        return;
      }

      setUserId(user.id);

      // 2. Fetch profile from public.profiles schema table
      const { data, error, status } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setName(data.full_name || '');
        setPhone(data.phone || '');
        setAvatarUrl(data.avatar_url || AVATARS[0].url);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred fetching your profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    if (!name.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'All personal details are required for deliveries.');
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
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditing(false);
      setIsChoosingAvatar(false);
    } catch (error: any) {
      Alert.alert('Save Error', error.message || 'Failed to update backend profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChoosingAvatar(false);
    fetchUserProfile(); // Restores original database entries
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6b46c1" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} disabled={isSaving}>
          <Ionicons name="arrow-back" size={26} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Dynamic Avatar UI Section */}
      <View style={styles.profileSection}>
        {isEditing && isChoosingAvatar ? (
          /* Avatar selector shown inside the screen instead of the original image */
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorTitle}>Choose Avatar</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map((avatar) => (
                <TouchableOpacity 
                  key={avatar.id} 
                  onPress={() => {
                    setAvatarUrl(avatar.url);
                    setIsChoosingAvatar(false); // Snap back to view selected avatar
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
          /* Normal viewing / editing mode showing avatar picture */
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={() => isEditing && setIsChoosingAvatar(true)}
            disabled={!isEditing || isSaving}
          >
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          </TouchableOpacity>
        )}
        
        {!isChoosingAvatar && (
          <>
            <Text style={styles.userName}>{name.trim() || 'New User'}</Text>
            {isEditing && (
              <Text style={styles.changeHint}>Tap image to change avatar</Text>
            )}
          </>
        )}
      </View>

      {/* Personal Information Form */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        {/* Full Name Row */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Full Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              editable={!isSaving}
            />
          ) : (
            <Text style={styles.value}>{name || 'Not Set'}</Text>
          )}
        </View>

        {/* Phone Number Row */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone Number</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Enter phone number"
              editable={!isSaving}
            />
          ) : (
            <Text style={styles.value}>{phone || 'Not Set'}</Text>
          )}
        </View>
      </View>

      {/* Action Controller Buttons */}
      {isEditing ? (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.btn, styles.cancelButton]} 
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.saveButton]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
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
  content: {
    padding: 16,
    marginBottom: "90%",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 160,
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0d9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeHint: {
    fontSize: 13,
    color: '#6b46c1',
    fontWeight: '500',
    marginTop: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  /* Embedded Choose Avatar Panel styles */
  selectorContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2d9ff',
  },
  selectorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6b46c1',
    marginBottom: 12,
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
  /* Card Layouts */
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    minHeight: 60,
  },
  label: {
    fontSize: 15,
    color: '#64748b',
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'right',
    flex: 2,
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b46c1',
    backgroundColor: '#f8f6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    textAlign: 'right',
    flex: 2,
    borderWidth: 1,
    borderColor: '#e2d9ff',
  },
  editButton: {
    backgroundColor: '#6b46c1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  btn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 17,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});