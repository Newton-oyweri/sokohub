import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

// Real-world Nairobi marketplace delivery variations
const DELIVERY_LOCATIONS = [
  { id: '1', name: 'Kilimani, Nairobi', time: '45-60 mins' },
  { id: '2', name: 'Westlands, Nairobi', time: '30-45 mins' },
  { id: '3', name: 'CBD, Nairobi', time: '20-35 mins' },
  { id: '4', name: 'Karen, Nairobi', time: '60-75 mins' },
];

export default function OrderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [customWriting, setCustomWriting] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(DELIVERY_LOCATIONS[0]);
  
  // Success states to replace standard native alerts
  const [isOrdered, setIsOrdered] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  const cakePricePerUnit = 500; 
  const deliveryFee = 150;
  const totalPrice = cakePricePerUnit * quantity + deliveryFee;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleConfirmOrder = () => {
    // Generate a clean dummy marketplace receipt match sequence
    const generatedReceipt = `SH-${Math.floor(100000 + Math.random() * 900000)}`;
    setReceiptNumber(generatedReceipt);
    setIsOrdered(true);
  };

  // Render Order Success Screen Overlay View 
  if (isOrdered) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Cake Order Received!</Text>
          <Text style={styles.successMessage}>
            Your sweet order details have been cleanly processed. Our chefs are spinning up something magical!
          </Text>
          
          <View style={styles.receiptBox}>
            <Text style={styles.receiptLabel}>RECEIPT NUMBER</Text>
            <Text style={styles.receiptValue}>{receiptNumber}</Text>
          </View>

          <TouchableOpacity 
            style={styles.successBtn} 
            activeOpacity={0.8}
            onPress={() => {
              setIsOrdered(false);
              router.dismissAll();
            }}
          >
            <Text style={styles.successBtnText}>Back to Marketplace</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        
        {/* Cake Summary Card */}
        <View style={styles.card}>
          <Image 
            source={require('../../assets/images/cake.png')} 
            style={styles.cakeImage} 
            resizeMode="cover"
          />
          <View style={styles.cakeDetails}>
            <Text style={styles.cakeName}>Wonderland Special</Text>
            <Text style={styles.cakeTagline}>Rich layers with premium sweet cream icing</Text>
            <Text style={styles.cakePriceText}>KSh {cakePricePerUnit}</Text>
          </View>
        </View>

        {/* Custom Text Inscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Describe anything you would like us to write on it.(Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Happy Birthday John!"
            placeholderTextColor="#94a3b8"
            value={customWriting}
            onChangeText={setCustomWriting}
            maxLength={40}
          />
        </View>
        
        {/* Quantity Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity style={styles.counterBtn} onPress={handleDecrement}>
              <Text style={styles.counterBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{quantity}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={handleIncrement}>
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Select Delivery Location Nodes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Delivery Location</Text>
          <View style={styles.locationGrid}>
            {DELIVERY_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                style={[
                  styles.locationCard,
                  selectedLocation.id === loc.id && styles.selectedLocationCard
                ]}
                onPress={() => setSelectedLocation(loc)}
              >
                <Text style={[
                  styles.locationName, 
                  selectedLocation.id === loc.id && styles.selectedLocationText
                ]}>
                  {loc.name.split(',')[0]}
                </Text>
                <Text style={styles.locationTime}>{loc.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Delivery Summary Info Frame */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <View style={styles.deliveryBox}>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Selected Target:</Text>
              <Text style={styles.deliveryValue}>{selectedLocation.name}</Text>
            </View>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Estimated Window:</Text>
              <Text style={styles.deliveryValue}>{selectedLocation.time}</Text>
            </View>
          </View>
        </View>

        {/* Bill Summary Breakdown */}
        <View style={styles.billingSection}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>KSh {cakePricePerUnit * quantity}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValue}>KSh {deliveryFee}</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>KSh {totalPrice}</Text>
          </View>
        </View>
      </ScrollView>

{/* Update your footer wrapper to inject the dynamic bottom safe padding */}
<View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
  <TouchableOpacity 
    style={styles.checkoutButton}
    activeOpacity={0.8}
    onPress={handleConfirmOrder}
  >
    <Text style={styles.checkoutButtonText}>Confirm Order (KSh {totalPrice})</Text>
  </TouchableOpacity>
</View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4ff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 130, 
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cakeImage: {
    width: 90,
    height: 90,
    borderRadius: 14,
  },
  cakeDetails: {
    flex: 1,
    marginLeft: 16,
  },
  cakeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  cakeTagline: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 6,
  },
  cakePriceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6b46c1',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  counterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
  },
  counterBtnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  counterValue: {
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  textInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  locationCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
  },
  selectedLocationCard: {
    borderColor: '#6b46c1',
    backgroundColor: '#f3e8ff',
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  selectedLocationText: {
    color: '#6b46c1',
  },
  locationTime: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  deliveryBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  deliveryValue: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: 14,
  },
  billingSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  billValue: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: 14,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 6,
    paddingTop: 12,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6b46c1',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  checkoutButton: {
    backgroundColor: '#6b46c1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  /* Custom Success Overlay Screen Styles */
  successContainer: {
    flex: 1,
    backgroundColor: '#f8f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  successIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  receiptBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
  },
  receiptValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6b46c1',
    marginTop: 4,
  },
  successBtn: {
    backgroundColor: '#6b46c1',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
  },
  successBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});