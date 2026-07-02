// OrderScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfirmOrder from './ConfirmOrder';
import ProductDisplay from './display';

const DEFAULT_PRODUCT = {
  id: 'default',
  seller_id: 'default', // Added seller_id
  name: 'Wonderland Special',
  price: 500,
  description: 'Rich layers with premium sweet cream icing',
  image_urls: ['https://via.placeholder.com/400x300/6b46c1/ffffff?text=Wonderland'],
};

export default function OrderScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const product = useMemo(() => {
    if (params.id) {
      let imageUrls: string[] = [];
      try {
        if (params.image_urls) {
          if (typeof params.image_urls === 'string') {
            if (params.image_urls.startsWith('http')) {
              imageUrls = [params.image_urls];
            } else {
              const parsed = JSON.parse(params.image_urls as string);
              imageUrls = Array.isArray(parsed) ? parsed : [params.image_urls];
            }
          } else if (Array.isArray(params.image_urls)) {
            imageUrls = params.image_urls as string[];
          }
        }
      } catch (e) {
        imageUrls = [params.image_urls as string];
      }

      return {
        id: params.id as string || 'default',
        seller_id: params.seller_id as string || DEFAULT_PRODUCT.seller_id, // Added seller_id extraction
        name: params.name as string || DEFAULT_PRODUCT.name,
        price: parseFloat(params.price as string) || DEFAULT_PRODUCT.price,
        description: params.description as string || DEFAULT_PRODUCT.description,
        image_urls: imageUrls.length > 0 ? imageUrls : DEFAULT_PRODUCT.image_urls,
      };
    }
    return DEFAULT_PRODUCT;
  }, [params.id, params.seller_id, params.name, params.price, params.description, params.image_urls]);

  const [quantity, setQuantity] = useState(1);
  const [customWriting, setCustomWriting] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  
  const [isPickup, setIsPickup] = useState(false);
  const [isDoorDelivery, setIsDoorDelivery] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

  const customerId = typeof params.customerId === 'string'
    ? params.customerId
    : typeof params.customer_id === 'string'
      ? params.customer_id
      : '';
  const sellerId = typeof params.sellerId === 'string'
    ? params.sellerId
    : typeof params.seller_id === 'string'
      ? params.seller_id
      : product.seller_id || ''; // Fallback to product's seller_id

  const cakePricePerUnit = product.price;
  const serviceFee = isDoorDelivery ? 150 : 0; 
  const subtotal = cakePricePerUnit * quantity;
  const totalPrice = subtotal + serviceFee;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const selectPickup = () => {
    setIsPickup(true);
    setIsDoorDelivery(false);
  };

  const selectDoorDelivery = () => {
    setIsDoorDelivery(true);
    setIsPickup(false);
    if (!deliveryAddress) {
      setDeliveryAddress('House 24, Greenview Apartments, Off Ngong Road, Near Naivas Prestige, Kilimani, Nairobi. Call on arrival: 0712 345 678.');
    }
  };

  const triggerCheckoutModal = () => {
    if (!isPickup && !isDoorDelivery) {
      Alert.alert('Selection Required', 'Please select either Pickup Location or Door Delivery.');
      return;
    }
    if (isDoorDelivery && !deliveryAddress.trim()) {
      Alert.alert('Address Required', 'Please provide an address for door delivery.');
      return;
    }
    setIsModalVisible(true);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 140 }]}
      >
        <ProductDisplay product={product} />

        {/* Custom Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Message</Text>
          <Text style={styles.sectionSubtitle}>Anything you'd like us to write on it? (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Happy Birthday John!"
            placeholderTextColor="#94a3b8"
            value={customWriting}
            onChangeText={setCustomWriting}
            maxLength={50}
          />
          <Text style={styles.charCount}>{customWriting.length}/50</Text>
        </View>
        
        {/* Quantity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity style={styles.counterBtn} onPress={handleDecrement}>
              <Ionicons name="remove" size={20} color="#0f172a" />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{quantity}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={handleIncrement}>
              <Ionicons name="add" size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Fulfillment Method */}
        <View style={styles.deliveryHeader}>
          <Ionicons name="bicycle-outline" size={22} color="#6b46c1" />
          <Text style={styles.sectionTitle}>How would you like your order?</Text>
        </View>

        {/* Pickup Choice */}
        <TouchableOpacity 
          style={[styles.fulfillmentOption, isPickup && styles.activeOptionBorder]} 
          onPress={selectPickup}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isPickup ? "checkbox" : "square-outline"} 
            size={24} 
            color={isPickup ? "#6b46c1" : "#94a3b8"} 
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.locationName}>Pickup Location</Text>
            <Text style={styles.locationDetail}>Bungoma, Kibabii (Opposite Main Gate)</Text>
          </View>
        </TouchableOpacity>

        {/* Door Delivery Choice */}
        <TouchableOpacity 
          style={[styles.fulfillmentOption, isDoorDelivery && styles.activeOptionBorder, { marginTop: 12 }]}
          onPress={selectDoorDelivery}
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isDoorDelivery ? "checkbox" : "square-outline"} 
            size={24} 
            color={isDoorDelivery ? "#6b46c1" : "#94a3b8"} 
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.toggleTitle}>Door Delivery</Text>
            <Text style={styles.toggleSubtitle}>Delivery directly to your location</Text>
          </View>
        </TouchableOpacity>

        {/* Dynamic Custom Address Field */}
        {isDoorDelivery && (
          <View style={styles.addressInputContainer}>
            <TextInput
              style={styles.addressInput}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Enter specific layout steps, house numbers, or landmarks..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.addressSample}>
              <Ionicons name="bulb-outline" size={16} color="#94a3b8" />
              <Text style={styles.addressSampleText}>
                Example address: House 24, Greenview Apartments, Off Ngong Road, Near Naivas Prestige, Kilimani, Nairobi. Call on arrival: 0712 345 678.
              </Text>
            </View>
          </View>
        )}

        {/* Actual Dynamic Selected Location Block */}
        {(isPickup || isDoorDelivery) && (
          <View style={[styles.deliveryBox, { marginTop: 24 }]}>
            <View style={styles.deliveryRow}>
              <View style={styles.deliveryIconRow}>
                <Ionicons name={isPickup ? "location" : "home"} size={18} color="#64748b" />
                <Text style={styles.deliveryLabel}>Destination</Text>
              </View>
              <Text style={styles.deliveryValue} numberOfLines={3}>
                {isPickup ? 'Bungoma, Kibabii (Opposite Main Gate)' : (deliveryAddress || 'No address provided yet')}
              </Text>
            </View>
            <View style={styles.deliveryRow}>
              <View style={styles.deliveryIconRow}>
                <Ionicons name="card-outline" size={18} color="#64748b" />
                <Text style={styles.deliveryLabel}>Service Fee</Text>
              </View>
              <Text style={styles.deliveryValue}>
                {isDoorDelivery ? `KSh ${serviceFee}` : 'Free'}
              </Text>
            </View>
          </View>
        )}

        {/* Bill Summary */}
        <View style={styles.billingSection}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal ({quantity} x KSh {cakePricePerUnit})</Text>
            <Text style={styles.billValue}>KSh {subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Service Fee</Text>
            <Text style={styles.billValue}>{isDoorDelivery ? `KSh ${serviceFee}` : 'KSh 0'}</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>KSh {totalPrice}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer System Panel */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={[styles.checkoutButton, (!isPickup && !isDoorDelivery) && styles.disabledCheckoutButton]}
          activeOpacity={0.8}
          onPress={triggerCheckoutModal}
        >
          <Text style={styles.checkoutButtonText}>
            {(!isPickup && !isDoorDelivery) ? "Select Delivery Method" : `Confirm Order · KSh ${totalPrice}`}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmOrder 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAuthRequired={() => Alert.alert('Authentication required', 'Please sign in to continue.')}
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          seller_id: product.seller_id, // Pass seller_id from product
        }}
        quantity={quantity}
        customWriting={customWriting}
        fulfillmentMethod={isDoorDelivery ? 'door_delivery' : 'pickup'}
        deliveryAddress={deliveryAddress}
        totalPrice={totalPrice}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        receiptNumber={receiptNumber}
        setReceiptNumber={setReceiptNumber}
        customerId={customerId}
        sellerId={sellerId || product.seller_id || ''} // Use sellerId from params or product
      />
    </KeyboardAvoidingView>
  );
}

// ... (styles remain the same)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  scrollContainer: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  sectionSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 10 },
  textInput: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, fontSize: 15, color: '#0f172a', borderWidth: 1, borderColor: '#e2e8f0' },
  charCount: { textAlign: 'right', fontSize: 12, color: '#94a3b8', marginTop: 4 },
  counterContainer: { alignItems: 'center', backgroundColor: '#fff', alignSelf: 'flex-start', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden', flexDirection: 'row' },
  counterBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#f1f5f9' },
  counterValue: { paddingHorizontal: 24, fontSize: 18, fontWeight: '700', color: '#0f172a' },
  deliveryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 8 },
  fulfillmentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 12 },
  activeOptionBorder: { borderColor: '#6b46c1', backgroundColor: '#fdfbff' },
  optionTextContainer: { flex: 1 },
  locationName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  locationDetail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  toggleSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  addressInputContainer: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 12, overflow: 'hidden' },
  addressInput: { paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0f172a', minHeight: 90, textAlignVertical: 'top' },
  addressSample: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 8, backgroundColor: '#faf9fe' },
  addressSampleText: { fontSize: 12, color: '#7c3aed', flex: 1, lineHeight: 17, fontWeight: '500' },
  deliveryBox: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 12, marginBottom: 24 },
  deliveryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  deliveryIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '30%' },
  deliveryLabel: { color: '#64748b', fontSize: 14 },
  deliveryValue: { fontWeight: '600', color: '#0f172a', fontSize: 14, width: '70%', textAlign: 'right' },
  billingSection: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginTop: 8 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { color: '#64748b', fontSize: 14 },
  billValue: { fontWeight: '600', color: '#0f172a', fontSize: 14 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 6, paddingTop: 12, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#6b46c1' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  checkoutButton: { backgroundColor: '#6b46c1', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  disabledCheckoutButton: { backgroundColor: '#cbd5e1' },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});