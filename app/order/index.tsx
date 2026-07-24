// OrderScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
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
import LocationSelector, { ActiveLocation } from './LocationSelector';
import SizeGuideSelector from './Sizeguide';

const DEFAULT_PRODUCT = {
  id: 'default',
  seller_id: 'default',
  name: 'Wonderland Special',
  price: 500,
  description: 'Rich layers with premium sweet cream icing',
  image_urls: ['https://via.placeholder.com/400x300/6b46c1/ffffff?text=Wonderland'],
  category: 'fashion',
  product_category_id: 'fashion',
};

interface InfoModalState {
  title: string;
  message: string;
}

function InfoModal({
  info,
  onClose,
}: {
  info: InfoModalState | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={!!info}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalIconWrap}>
            <Ionicons name="alert-circle" size={28} color="#6b46c1" />
          </View>
          <Text style={styles.modalTitle}>{info?.title}</Text>
          <Text style={styles.modalMessage}>{info?.message}</Text>

          <TouchableOpacity style={styles.modalButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.modalButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function OrderScreen() {
  const router = useRouter();
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
        id: (params.id as string) || 'default',
        seller_id: (params.seller_id as string) || DEFAULT_PRODUCT.seller_id,
        name: (params.name as string) || DEFAULT_PRODUCT.name,
        price: parseFloat(params.price as string) || DEFAULT_PRODUCT.price,
        description: (params.description as string) || DEFAULT_PRODUCT.description,
        image_urls: imageUrls.length > 0 ? imageUrls : DEFAULT_PRODUCT.image_urls,
        category: (params.category as string) || 'fashion',
        product_category_id: (params.product_category_id as string) || 'fashion',
      };
    }
    return DEFAULT_PRODUCT;
  }, [
    params.id,
    params.seller_id,
    params.name,
    params.price,
    params.description,
    params.image_urls,
    params.category,
    params.product_category_id,
  ]);

  const [quantity, setQuantity] = useState(1);
  const [customWriting, setCustomWriting] = useState('');
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState('Khaki');
  const [selectedLocation, setSelectedLocation] = useState<ActiveLocation | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

  const [infoModal, setInfoModal] = useState<InfoModalState | null>(null);

  const [locationRefreshKey, setLocationRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setLocationRefreshKey((k) => k + 1);
    }, [])
  );

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

  const isFashion =
    product.product_category_id?.toLowerCase() === 'fashion' ||
    product.category?.toLowerCase().includes('fashion');

  const cakePricePerUnit = product.price;
  const serviceFee = 0;
  const subtotal = cakePricePerUnit * quantity;
  const totalPrice = subtotal + serviceFee;

  const fulfillmentMethod = selectedLocation?.location_type || 'door_delivery';
  const displayAddress = selectedLocation?.displayAddress || '';

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const triggerCheckoutModal = () => {
    if (!selectedLocation || !displayAddress) {
      setInfoModal({
        title: 'Location Required',
        message: 'Please set your pickup or delivery location before placing an order.',
      });
      return;
    }
    setIsModalVisible(true);
  };

  const handleAuthRequired = () => {
    setInfoModal({
      title: 'Authentication Required',
      message: 'Please sign in to continue.',
    });
  };

  // Build full order note combining size, color & custom message for checkout flow
  const finalOrderNote = [
    isFashion ? `Size: ${selectedSize}` : null,
    isFashion ? `Color: ${selectedColor}` : null,
    customWriting ? `Note: ${customWriting}` : null,
  ]
    .filter(Boolean)
    .join(' | ');

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

        {/* Fashion Category Options & Size Guides Dropdown */}
        {isFashion && (
          <SizeGuideSelector
            categoryId={product.category}
            productCategoryId={product.product_category_id}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
          />
        )}

        {/* Location Selection Component */}
        <LocationSelector
          key={locationRefreshKey}
          onLocationFetched={(loc) => setSelectedLocation(loc)}
        />

        {/* Custom Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Instructions</Text>
          <Text style={styles.sectionSubtitle}>Anything else you'd like us to know? (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Deliver after 3 PM"
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

        {/* Selected Location Summary Block */}
        <View style={[styles.deliveryBox, { marginTop: 16 }]}>
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryIconRow}>
              <Ionicons
                name={fulfillmentMethod === 'pickup' ? 'location' : 'home'}
                size={18}
                color="#64748b"
              />
              <Text style={styles.deliveryLabel}>
                {fulfillmentMethod === 'pickup' ? 'Pickup Spot' : 'Destination'}
              </Text>
            </View>
            <Text style={styles.deliveryValue} numberOfLines={3}>
              {displayAddress || 'No location set yet'}
            </Text>
          </View>
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryIconRow}>
              <Ionicons name="card-outline" size={18} color="#64748b" />
              <Text style={styles.deliveryLabel}>Service Fee</Text>
            </View>
            <Text style={styles.deliveryValue}>KSh {serviceFee}</Text>
          </View>
        </View>

        {/* Bill Summary */}
        <View style={styles.billingSection}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>
              Subtotal ({quantity} x KSh {cakePricePerUnit})
            </Text>
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
        onAuthRequired={handleAuthRequired}
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          seller_id: product.seller_id,
        }}
        quantity={quantity}
        customWriting={finalOrderNote}
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

      <InfoModal info={infoModal} onClose={() => setInfoModal(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  scrollContainer: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  sectionSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 10 },
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
  charCount: { textAlign: 'right', fontSize: 12, color: '#94a3b8', marginTop: 4 },
  counterContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  counterBtn: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#f1f5f9' },
  counterValue: { paddingHorizontal: 24, fontSize: 18, fontWeight: '700', color: '#0f172a' },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fdfbff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
  },
  deliveryBannerText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0f172a', lineHeight: 20 },
  deliveryBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
    marginBottom: 24,
  },
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  checkoutButton: { backgroundColor: '#6b46c1', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#faf5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  modalButton: {
    backgroundColor: '#6b46c1',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

