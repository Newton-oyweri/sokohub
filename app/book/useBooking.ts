// \~/.../app/book/useBooking.ts
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export const useBooking = (
  productId: string,
  productName: string,
  sellerId: string,
  user: any,
  profile: any,
  guests: string,
  duration: string,
  notes: string,
  setGuests: (v: string) => void,
  setNotes: (v: string) => void,
  setDuration: (v: string) => void,
  setSelectedDate: (d: Date) => void,
  showInAppNotification: (msg: string, type?: 'success' | 'error', timeout?: number) => void,
  fetchUserData: () => void
) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setGuests('');
    setNotes('');
    setDuration('This Month');
    setSelectedDate(new Date());
  }, [setGuests, setNotes, setDuration, setSelectedDate]);

  const performBooking = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    try {
      const guestCount = parseInt(guests);
      if (!guests || isNaN(guestCount) || guestCount < 1) {
        showInAppNotification('Please enter a valid number of guests', 'error');
        return;
      }

      setSubmitting(true);

      const bookingNotes = `
        Customer Email: ${user.email}
        Customer Phone: ${profile?.phone || 'Not provided'}
        Customer Name: ${profile?.full_name || 'Not provided'}
        ---
        Booking Details:
        Guests: ${guests}
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
      resetForm();
      fetchUserData();

    } catch (error: any) {
      showInAppNotification(error.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmAndSubmitBooking = () => {
    Alert.alert(
      'Confirm Booking',
      `Are you sure you want to submit this booking request?\n\n` +
      `Cake: ${productName}\n` +
      `Guests: ${guests || '—'}\n` +
      `Needed by: ${duration}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Book Now', style: 'default', onPress: performBooking },
      ],
      { cancelable: true }
    );
  };

  return {
    submitting,
    handleBooking: confirmAndSubmitBooking,
  };
};
