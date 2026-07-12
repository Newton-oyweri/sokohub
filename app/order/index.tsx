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
  seller_id: 'default', 
  name: 'Wonderland Special',
  price: 500,
  description: 'Rich layers with premium sweet cream icing',
  image_urls: ['https://via.placeholder.com/400x300/6b46c1/ffffff?text=Wonderland'],
};

const KIBABII_ADDRESS = 'Bungoma, Kibabii opposite main gate';

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
        seller_id: params.seller_id as string || DEFAULT_PRODUCT.seller_id, 
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
  const [isKibabiiSelected, setIsKibabiiSelected] = useState(false);

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
      : product.seller_id || ''; 

  const cakePricePerUnit = product.price;
  const serviceFee = 0;
  const subtotal = cakePricePerUnit * quantity;
  const totalPrice = subtotal + serviceFee;

  // Deriving active fulfillment configurations implicitly from selection state
  const fulfillmentMethod = isKibabiiSelected ? 'pickup' : 'door_delivery';
  const displayAddress = isKibabiiSelected ? KIBABII_ADDRESS : deliveryAddress;

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const toggleKibabiiPoint = () => {
    if (isKibabiiSelected) {
      setIsKibabiiSelected(false);
    } else {
      setIsKibabiiSelected(true);
      setDeliveryAddress(''); // Clear out manually entered text when opting for pickup
    }
  };

  const handleAddressChange = (text: string) => {
    if (isKibabiiSelected) {
      setIsKibabiiSelected(false);
    }
    setDeliveryAddress(text);
  };

  const triggerCheckoutModal = () => {
    if (fulfillmentMethod === 'door_delivery' && !deliveryAddress.trim()) {
      Alert.alert('Address Required', 'Please provide an address for door delivery or select self-pickup.');
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

        {/* Delivery Coverage Banner */}
        <View style={styles.deliveryBanner}>
          <Ionicons name="bicycle-outline" size={22} color="#6b46c1" />
          <Text style={styles.deliveryBannerText}>
            Same day fast deliveries in Kisii, Nairobi, Bungoma & Nakuru
          </Text>
        </View>

        {/* Quick Pickup Point Selector */}
        <TouchableOpacity
          style={[styles.quickPointRow, isKibabiiSelected && styles.quickPointRowActive]}
          onPress={toggleKibabiiPoint}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, isKibabiiSelected && styles.checkboxChecked]}>
            {isKibabiiSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <View style={styles.quickPointTextWrap}>
            <Text style={styles.quickPointLabel}>Bungoma, Kibabii opposite main gate</Text>
            <Text style={styles.quickPointSubtitle}>Tap here to select as Self-Pickup point</Text>
          </View>
        </TouchableOpacity>

        {/* Conditional Field: Only display text fields for standard deliveries */}
        {!isKibabiiSelected && (
          <View style={styles.addressInputContainer}>
            <TextInput
              style={styles.addressInput}
              value={deliveryAddress}
              onChangeText={handleAddressChange}
              placeholder="Enter your address here ..."
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

        {/* Selected Location Block */}
        <View style={[styles.deliveryBox, { marginTop: 24 }]}>
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryIconRow}>
              <Ionicons 
                name={fulfillmentMethod === 'pickup' ? "location" : "home"} 
                size={18} 
                color="#64748b" 
              />
              <Text style={styles.deliveryLabel}>
                {fulfillmentMethod === 'pickup' ? 'Pickup Spot' : 'Destination'}
              </Text>
            </View>
            <Text style={styles.deliveryValue} numberOfLines={3}>
              {displayAddress || 'No address provided yet'}
            </Text>
          </View>
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryIconRow}>
              <Ionicons name="card-outline" size={18} color="#64748b" />
              <Text style={styles.deliveryLabel}>Service Fee</Text>
            </View>
            <Text style={styles.deliveryValue}>
              KSh {serviceFee}
            </Text>
          </View>
        </View>

        {/* Bill Summary */}
        <View style={styles.billingSection}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal ({quantity} x KSh {cakePricePerUnit})</Text>
            <Text style={styles.billValue}>KSh {subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Service Fee</Text>
            <Text style={styles.billValue}>KSh {serviceFee}</Text>
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
          style={styles.checkoutButton}
          activeOpacity={0.8}
          onPress={triggerCheckoutModal}
        >
          <Text style={styles.checkoutButtonText}>
            {`Confirm Order · KSh ${totalPrice}`}
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
          seller_id: product.seller_id,
        }}
        quantity={quantity}
        customWriting={customWriting}
        fulfillmentMethod={fulfillmentMethod}
        deliveryAddress={displayAddress}
        totalPrice={totalPrice}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        receiptNumber={receiptNumber}
        setReceiptNumber={setReceiptNumber}
        customerId={customerId}
        sellerId={sellerId || product.seller_id || ''}
      />
    </KeyboardAvoidingView>
  );
}

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
  deliveryBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fdfbff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', padding: 16, marginBottom: 12 },
  deliveryBannerText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0f172a', lineHeight: 20 },
  quickPointRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', padding: 14, marginBottom: 12, gap: 12 },
  quickPointRowActive: { borderColor: '#6b46c1', backgroundColor: '#faf9fe' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#6b46c1', borderColor: '#6b46c1' },
  quickPointTextWrap: { flex: 1 },
  quickPointLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  quickPointSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  addressInputContainer: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#e2e8f0', overflow: 'hidden' },
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
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});