import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  Image,
  FlatList,
  Animated, // <--- Imported Animated
} from 'react-native';

import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../../lib/supabase';
import WeddingCakesContent from '../../components/WeddingCakesContent';
import BookingFormInputs from './BookingFormInputs';

export default function BookWeddingCake() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get product data from navigation params
  const productId = params.id as string;
  const productName = (params.name as string) || 'Wedding Cake';
  const productPrice = parseFloat(params.price as string) || 0;
  const sellerId = params.seller_id as string;
  const imageUrls = params.image_urls
    ? JSON.parse(params.image_urls as string)
    : [];

  const [guests, setGuests] = useState('');
  const [duration, setDuration] = useState('This Month');
  const [notes, setNotes] = useState('');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [pendingGuestCount, setPendingGuestCount] = useState<number | null>(null);

  // --- In-App Notification State ---
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  // Date picker states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  const options = ['Tomorrow', 'This Week', 'This Month', 'Choose Date'];

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

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
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      return () => {};
    }, [fetchUserData])
  );

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

  // Helper to trigger notification banner with timeout
  const showInAppNotification = (message: string, type: 'success' | 'error' = 'success', timeoutMs = 4000) => {
    setNotification({ visible: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, timeoutMs);
  };

  // Helper to reset inputs and refresh data
  const resetFormAndRefresh = () => {
    setGuests('');
    setNotes('');
    setDuration('This Month');
    setSelectedDate(new Date());
    setActiveImageIndex(0);
    fetchUserData(); // Re-fetches user/profile info
  };

const handleBooking = () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    const guestCount = parseInt(guests);
    if (!guests || isNaN(guestCount) || guestCount < 1) {
      showInAppNotification('Please enter a valid number of guests', 'error');
      return;
    }

    setPendingGuestCount(guestCount);
    setShowConfirmModal(true);
  };

  const submitBooking = async () => {
    if (pendingGuestCount === null) return;
    setShowConfirmModal(false);

    try {
      setSubmitting(true);

      const bookingNotes = `
        Customer Email: ${user.email}
        Customer Phone: ${profile?.phone || 'Not provided'}
        Customer Name: ${profile?.full_name || 'Not provided'}
        ---
        Booking Details:
        Guests: ${pendingGuestCount}
        Needed by: ${duration}
        Special Requests: ${notes || 'None'}
      `.trim();

      const { error: orderError } = await supabase.from('orders').insert({
        customer_id: user.id,
        product_id: productId,
        seller_id: sellerId,
        status: 'pending',
        notes: bookingNotes,
        order_type: 'booking',
      });

      if (orderError) throw orderError;

      showInAppNotification('Booking submitted successfully! We will contact you shortly.', 'success', 4000);
      resetFormAndRefresh();
    } catch (error: any) {
      showInAppNotification(error.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
      setPendingGuestCount(null);
    }
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={[
        styles.imageDot,
        activeImageIndex === index && styles.imageDotActive,
      ]}
      onPress={() => setActiveImageIndex(index)}
    >
      <Image
        source={{ uri: item }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6b46c1" />
      </SafeAreaView>
    );
  }

  if (!productId) {
    return (
      <SafeAreaView style={styles.container}>
        <WeddingCakesContent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating In-App Notification Banner */}
      {notification.visible && (
        <View
          style={[
            styles.notificationBanner,
            notification.type === 'error' ? styles.notificationError : styles.notificationSuccess,
          ]}
        >
          <Ionicons
            name={notification.type === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
            size={24}
            color="#fff"
          />
          <Text style={styles.notificationText}>{notification.message}</Text>
        </View>
      )}
<Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.ConfirmmodalOverlay}>
          <View style={styles.confirmModalCard}>
            <Text style={styles.confirmModalTitle}>Confirm Booking</Text>
            <Text style={styles.confirmModalMessage}>
              Book {productName} for {pendingGuestCount} guest{pendingGuestCount !== 1 ? 's' : ''}, needed by {duration}?
            </Text>
            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalCancel]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.confirmModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.confirmModalConfirm]}
                onPress={submitBooking}
              >
                <Text style={styles.confirmModalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Book Wedding Cake</Text>
        <Text style={styles.subtitle}>
          You're almost done. Tell us a few details and we'll contact you with a
          quotation.
        </Text>

        {/* Cake with Images */}
        <View style={styles.card}>
          {imageUrls.length > 0 && (
            <View style={styles.mainImageContainer}>
              <Image
                source={{ uri: imageUrls[activeImageIndex] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              {imageUrls.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {activeImageIndex + 1} / {imageUrls.length}
                  </Text>
                </View>
              )}
            </View>
          )}

          {imageUrls.length > 1 && (
            <View style={styles.thumbnailContainer}>
              <FlatList
                data={imageUrls}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => `${item}-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailList}
              />
            </View>
          )}

          <View style={styles.productInfo}>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.productPrice}>
              KSh {productPrice.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Separated Booking Form Inputs */}
        <BookingFormInputs
          guests={guests}
          setGuests={setGuests}
          duration={duration}
          options={options}
          handleOptionPress={handleOptionPress}
          notes={notes}
          setNotes={setNotes}
        />

        {/* User Details */}
        <Text style={styles.sectionTitle}>My contact</Text>

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
                <Text style={styles.userDetailValue}>
                  {profile?.phone || 'Not set'}
                </Text>
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
          <Text style={styles.summaryTitle}>Booking Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cake</Text>
            <Text style={styles.summaryValue}>{productName}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests</Text>
            <Text style={styles.summaryValue}>{guests || '--'}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Needed</Text>
            <Text style={styles.summaryValue}>{duration}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <Text style={styles.priceTitle}>Starting Price</Text>

          <Text style={styles.bigPrice}>
            KSh {productPrice.toLocaleString()}+
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleBooking}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>
              {!user ? 'Login to Book' : 'Book Now'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footer}>
          After booking, our team will contact you to discuss the final design,
          quotation and delivery arrangements.
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
  // In-app Notification Styles
  notificationBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  notificationSuccess: {
    backgroundColor: '#10b981',
  },
  notificationError: {
    backgroundColor: '#ef4444',
  },
  notificationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
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
  mainImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailContainer: {
    marginBottom: 12,
  },
  thumbnailList: {
    gap: 8,
  },
  imageDot: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  imageDotActive: {
    borderColor: PRIMARY,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY,
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
  buttonDisabled: {
    opacity: 0.7,
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
  }
   ,
  ConfirmmodalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  } ,
  confirmModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1e293b',
  },
  confirmModalMessage: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmModalCancel: {
    backgroundColor: '#f1f5f9',
  },
  confirmModalConfirm: {
    backgroundColor: '#6b46c1',
  },
  confirmModalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  confirmModalConfirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});

