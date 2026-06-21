import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserProfile({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();

  // 1. Backend-ready state management
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Core startup details needed for delivery tracking & notifications
  const [name, setName] = useState('K.U. Student');
  const [email, setEmail] = useState('k.uymt@gmail.com');
  const [phone, setPhone] = useState('+254 700 000 000');

  // 2. Mock handler for saving to a backend database
  const handleSave = async () => {
    // Basic frontend validations before hitting the network
    if (!name.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Error', 'All fields are required for deliveries.');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace this with your actual backend integration, e.g.:
      // const response = await fetch('https://your-api.com/user/update', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, phone })
      // });
      // if (!response.ok) throw new Error();

      // Simulating a network delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} disabled={isLoading}>
          <Ionicons name="arrow-back" size={26} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Profile</Text>
      </View>

      {/* Profile Picture Status */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={70} color="#6b46c1" />
        </View>
        <Text style={styles.userName}>{name}</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      {/* Dynamic Profile Details Form */}
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
              editable={!isLoading}
            />
          ) : (
            <Text style={styles.value}>{name}</Text>
          )}
        </View>

        {/* Email Row */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email Address</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter email"
              editable={!isLoading}
            />
          ) : (
            <Text style={styles.value}>{email}</Text>
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
              editable={!isLoading}
            />
          ) : (
            <Text style={styles.value}>{phone}</Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      {isEditing ? (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.btn, styles.cancelButton]} 
            onPress={() => setIsEditing(false)}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.saveButton]} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
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
  content: {
    padding: 16,
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
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0d9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 16,
    color: '#6b46c1',
    marginTop: 4,
  },
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
    backgroundColor: '#10b981', // Clean startup green for saving successfully
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});