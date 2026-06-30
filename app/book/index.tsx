import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function BookWeddingCake() {
  const router = useRouter();

  const [guests, setGuests] = useState('');
  const [duration, setDuration] = useState('This Month');
  const [notes, setNotes] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Date picker states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const options = [
    'Tomorrow',
    'This Week',
    'This Month',
    'Choose Date',
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(user);

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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      if (selectedDate) {
        setSelectedDate(selectedDate);
      }
    } else {
      setShowDatePicker(false);
      if (selectedDate) {
        setSelectedDate(selectedDate);
        setDuration(formatDate(selectedDate));
      }
    }
  };

  const handleDateConfirm = () => {
    setShowDateModal(false);
    setDuration(formatDate(selectedDate));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleOptionPress = (item: string) => {
    if (item === 'Choose Date') {
      if (Platform.OS === 'ios') {
        setShowDateModal(true);
      } else {
        setShowDatePicker(true);
      }
    } else {
      setDuration(item);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6b46c1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Book Wedding Cake</Text>
        <Text style={styles.subtitle}>
          You're almost done. Tell us a few details and we'll contact you with a
          quotation.
        </Text>

        {/* Cake */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons
              name="sparkles"
              size={22}
              color="#6b46c1"
            />

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.label}>Selected Cake</Text>
              <Text style={styles.value}>
                Royal Wedding Cake
              </Text>
              <Text style={styles.price}>
                KSh 45,000
              </Text>
            </View>
          </View>
        </View>

        {/* Guests */}

        <Text style={styles.sectionTitle}>
          Number of Guests
        </Text>

        <TextInput
          value={guests}
          onChangeText={setGuests}
          keyboardType="numeric"
          placeholder="e.g. 250"
          style={styles.input}
        />

        {/* Duration */}

        <Text style={styles.sectionTitle}>
          When do you need it?
        </Text>

        <View style={styles.options}>
          {options.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => handleOptionPress(item)}
              style={[
                styles.option,
                duration === item && styles.optionActive,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  duration === item &&
                    styles.optionTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}

        <Text style={styles.sectionTitle}>
          Questions or Special Requests
        </Text>

        <TextInput
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholder="Tell us about your wedding theme, colours, flavours, delivery location or ask us any question..."
          style={styles.notes}
          textAlignVertical="top"
        />

        {/* User Details */}
        <Text style={styles.sectionTitle}>
          My contact
        </Text>

        {!user ? (
          <View style={styles.card}>
            <View style={styles.loginPrompt}>
              <Ionicons name="person-outline" size={32} color="#94a3b8" />
              <Text style={styles.loginPromptText}>You are not logged in</Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.userDetails}>
              <View style={styles.userDetailRow}>
                <Ionicons name="mail-outline" size={20} color="#6b46c1" />
                <Text style={styles.userDetailLabel}>Email</Text>
                <Text style={styles.userDetailValue}>{user.email}</Text>
              </View>
              
              <View style={styles.userDetailRow}>
                <Ionicons name="call-outline" size={20} color="#6b46c1" />
                <Text style={styles.userDetailLabel}>Phone</Text>
                <Text style={styles.userDetailValue}>{profile?.phone || 'Not set'}</Text>
              </View>

              {profile?.full_name && (
                <View style={styles.userDetailRow}>
                  <Ionicons name="person-outline" size={20} color="#6b46c1" />
                  <Text style={styles.userDetailLabel}>Name</Text>
                  <Text style={styles.userDetailValue}>{profile.full_name}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Summary */}

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>
            Booking Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Cake
            </Text>

            <Text style={styles.summaryValue}>
              Royal Wedding Cake
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Guests
            </Text>

            <Text style={styles.summaryValue}>
              {guests || '--'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Needed
            </Text>

            <Text style={styles.summaryValue}>
              {duration}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <Text style={styles.priceTitle}>
            Starting Price
          </Text>

          <Text style={styles.bigPrice}>
            KSh 45,000+
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>
            Book Now
          </Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          After booking, our team will contact you to
          discuss the final design, quotation and
          delivery arrangements.
        </Text>
      </ScrollView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDateModal}
          onRequestClose={() => setShowDateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDateModal(false)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={handleDateConfirm}>
                  <Text style={styles.modalDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </SafeAreaView>
  );
}

const PRIMARY = '#6b46c1';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: 20,
    paddingBottom: 90,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 8,
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 18,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  label: {
    color: '#64748b',
    fontSize: 13,
  },

  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },

  price: {
    marginTop: 4,
    color: PRIMARY,
    fontWeight: '800',
    fontSize: 17,
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 17,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  option: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 30,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  optionActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },

  optionText: {
    color: '#374151',
    fontWeight: '600',
  },

  optionTextActive: {
    color: '#fff',
  },

  notes: {
    backgroundColor: '#fff',
    borderRadius: 16,
    minHeight: 130,
    padding: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  small: {
    marginTop: 4,
    color: '#64748b',
    lineHeight: 20,
  },

  summary: {
    marginTop: 28,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },

  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 18,
    color: '#111827',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  summaryLabel: {
    color: '#64748b',
    fontSize: 15,
  },

  summaryValue: {
    fontWeight: '700',
    color: '#111827',
  },

  summaryDivider: {
    height: 1,
    backgroundColor: '#ececec',
    marginVertical: 16,
  },

  priceTitle: {
    color: '#64748b',
    fontSize: 14,
  },

  bigPrice: {
    marginTop: 6,
    color: PRIMARY,
    fontWeight: '800',
    fontSize: 30,
  },

  button: {
    marginTop: 28,
    backgroundColor: PRIMARY,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },

  footer: {
    marginTop: 18,
    textAlign: 'center',
    color: '#64748b',
    lineHeight: 22,
    fontSize: 14,
  },

  // User Details Styles
  userDetails: {
    width: '100%',
  },

  userDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  userDetailLabel: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 12,
    flex: 1,
  },

  userDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 2,
    textAlign: 'right',
  },

  loginPrompt: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  loginPromptText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 16,
  },

  loginButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },

  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },

  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },

  modalDoneText: {
    fontSize: 16,
    color: PRIMARY,
    fontWeight: '600',
  },

  datePicker: {
    height: 200,
  },
});