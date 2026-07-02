// ConfirmOrder.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface ConfirmOrderProps {
  isVisible: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    seller_id?: string;
  };
  quantity: number;
  customWriting: string;
  fulfillmentMethod: 'pickup' | 'door_delivery';
  deliveryAddress: string;
  totalPrice: number;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  receiptNumber: string | null;
  setReceiptNumber: (receipt: string | null) => void;
  customerId: string | null;
  sellerId: string | null;
  onAuthRequired: () => void;
}

export default function ConfirmOrder({
  isVisible,
  onClose,
  product,
  quantity,
  customWriting,
  fulfillmentMethod,
  deliveryAddress,
  totalPrice,
  isLoading,
  setIsLoading,
  receiptNumber,
  setReceiptNumber,
  customerId,
  sellerId,
  onAuthRequired,
}: ConfirmOrderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [checkingWallet, setCheckingWallet] = useState<boolean>(true);

  useEffect(() => {
    const checkSessionAndWallet = async () => {
      if (!isVisible) return;
      
      try {
        setCheckingWallet(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setSessionUser(session.user);
          
          // Fetch exact real-time wallet balance
          const { data: wallet, error: walletError } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (!walletError && wallet) {
            setWalletBalance(Number(wallet.balance));
          } else {
            setWalletBalance(0);
          }
        } else {
          setSessionUser(null);
          setWalletBalance(null);
        }
      } catch (error) {
        setSessionUser(null);
        setWalletBalance(null);
      } finally {
        setCheckingWallet(false);
      }
    };

    checkSessionAndWallet();
  }, [isVisible, totalPrice]);

  const generateReceiptNumber = () => {
    const prefix = 'SH';
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${timestamp}-${random}`;
  };

  const prepareOrderData = (userId: string, orderNum: string) => {
    return {
      customer_id: userId,
      product_id: product.id,
      seller_id: sellerId || product.seller_id || '',
      quantity: quantity,
      unit_price: product.price,
      total_amount: totalPrice,
      status: 'pending',
      order_number: orderNum,
      notes: {
        customWriting: customWriting.trim() || null,
        fulfillmentMethod: fulfillmentMethod,
        deliveryAddress: fulfillmentMethod === 'door_delivery' ? deliveryAddress : 'Bungoma, Kibabii (Opposite Main Gate)',
        productName: product.name,
        orderedAt: new Date().toISOString(),
      },
    };
  };

  const handleSignIn = () => {
    onClose();
    router.push('/auth');
  };

  const handleBackendSubmit = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      handleSignIn();
      return;
    }

    if (walletBalance !== null && walletBalance < totalPrice) {
      Alert.alert('Payment Denied', 'Insufficient funds in your digital wallet.');
      return;
    }

    setIsLoading(true);
    try {
      const orderNum = generateReceiptNumber();
      const orderPayload = prepareOrderData(session.user.id, orderNum);

      const { data, error } = await supabase.rpc('place_order_via_wallet', {
        p_order_payload: orderPayload,
        p_total_amount: totalPrice
      });

      if (error) throw error;
      
      if (data && data.success === false) {
        Alert.alert('Order Failed', data.error || 'Transaction could not be completed.');
        return;
      }

      setReceiptNumber(data.order_number || orderNum);
      
    } catch (error: any) {
      Alert.alert('System Error', error.message || 'An expected database failure occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const isLowBalance = walletBalance !== null && walletBalance < totalPrice;

  if (receiptNumber) {
    return (
      <Modal visible={isVisible} animationType="slide" transparent>
        <View style={[styles.successContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.successCard}>
            <View style={styles.successIcon} />
            <Text style={styles.successTitle}>Order Received</Text>
            <Text style={styles.successMessage}>Your order for {product.name} has been placed successfully</Text>
            <View style={styles.receiptBox}>
              <Text style={styles.receiptLabel}>ORDER NUMBER</Text>
              <Text style={styles.receiptValue}>{receiptNumber}</Text>
              <Text style={styles.receiptSubtext}>Paid via Account Balance</Text>
            </View>
            <TouchableOpacity 
              style={styles.successBtn} 
              activeOpacity={0.8} 
              onPress={() => {
                setReceiptNumber(null);
                onClose();
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.successBtnText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Confirm Order</Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading} style={styles.closeBtn}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>Review details before sending to kitchen</Text>
          
          <View style={styles.summaryContainer}>
            {checkingWallet ? (
              <View style={styles.loaderWrapper}>
                <ActivityIndicator size="small" color="#6b46c1" />
                <Text style={styles.loaderText}>Verifying wallet balance...</Text>
              </View>
            ) : (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Item</Text>
                  <Text style={styles.summaryValue}>{product.name} x{quantity}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Unit Price</Text>
                  <Text style={styles.summaryValue}>KSh {product.price}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fulfillment</Text>
                  <Text style={styles.summaryValue}>
                    {fulfillmentMethod === 'door_delivery' ? 'Door Delivery' : 'Self-Pickup'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Location</Text>
                  <Text style={styles.summaryValue} numberOfLines={2}>
                    {fulfillmentMethod === 'door_delivery' ? deliveryAddress : 'Bungoma, Kibabii (Opposite Main Gate)'}
                  </Text>
                </View>
                {customWriting.trim() && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Message</Text>
                    <Text style={styles.summaryValue} numberOfLines={2}>{customWriting}</Text>
                  </View>
                )}

                {/* Secure Account Balance Verification View */}
                {sessionUser && (
                  <View style={[styles.summaryRow, styles.walletRow]}>
                    <Text style={styles.summaryLabel}>Wallet Bal.</Text>
                    <Text style={[styles.summaryValue, isLowBalance ? styles.lowBalanceText : styles.goodBalanceText]}>
                      KSh {walletBalance?.toFixed(2)}
                    </Text>
                  </View>
                )}

                {/* Alert Box for Low Balance explicitly shown here */}
                {isLowBalance && sessionUser && (
                  <View style={styles.balanceAlertBox}>
                    <Text style={styles.balanceAlertText}>
                      Insufficient funds. Please top up KSh {(totalPrice - (walletBalance || 0)).toFixed(2)} to confirm.
                    </Text>
                  </View>
                )}

                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalValue}>KSh {totalPrice}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.cancelBtn]} 
              onPress={onClose} 
              disabled={isLoading}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.btn, 
                styles.confirmBtn, 
                (isLowBalance && sessionUser || checkingWallet) && styles.disabledBtn
              ]} 
              onPress={sessionUser ? handleBackendSubmit : handleSignIn} 
              disabled={isLoading || checkingWallet || (isLowBalance && sessionUser !== null)}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>
                  {!sessionUser ? 'Sign In to Order' : checkingWallet ? 'Verifying...' : isLowBalance ? 'Insufficient Balance' : 'Place Order'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    padding: 24,
    maxHeight: '75%', // Takes 3/4 of screen height
    minHeight: '75%', // Ensures it takes at least 3/4
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 28,
    color: '#64748b',
    fontWeight: '300',
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#0f172a' 
  },
  modalSubtitle: { 
    fontSize: 14, 
    color: '#64748b', 
    marginTop: 4, 
    marginBottom: 20 
  },
  summaryContainer: { 
    backgroundColor: '#f8f4ff', 
    borderRadius: 16, 
    padding: 16, 
    gap: 12, 
    marginBottom: 24,
    minHeight: 120,
    justifyContent: 'center',
    flexShrink: 1, // Allows container to shrink if content is too large
  },
  loaderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8
  },
  loaderText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500'
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  summaryLabel: { 
    color: '#64748b', 
    fontSize: 14, 
    width: '28%' 
  },
  summaryValue: { 
    fontWeight: '500', 
    color: '#0f172a', 
    fontSize: 14, 
    width: '72%', 
    textAlign: 'right' 
  },
  walletRow: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    marginTop: 4,
  },
  lowBalanceText: {
    color: '#ef4444',
    fontWeight: '700',
  },
  goodBalanceText: {
    color: '#22c55e',
    fontWeight: '600',
  },
  balanceAlertBox: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  balanceAlertText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center'
  },
  totalRow: { 
    borderTopWidth: 1, 
    borderTopColor: '#e2e8f0', 
    paddingTop: 12, 
    marginTop: 4, 
    alignItems: 'center' 
  },
  totalLabel: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#0f172a' 
  },
  totalValue: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#6b46c1' 
  },
  actionRow: { 
    flexDirection: 'row', 
    gap: 12 
  },
  btn: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  cancelBtn: { 
    backgroundColor: '#f1f5f9' 
  },
  cancelBtnText: { 
    color: '#64748b', 
    fontWeight: '600', 
    fontSize: 15 
  },
  confirmBtn: { 
    backgroundColor: '#6b46c1' 
  },
  disabledBtn: {
    backgroundColor: '#cbd5e1',
  },
  confirmBtnText: { 
    color: '#ffffff', 
    fontWeight: '600', 
    fontSize: 15 
  },
  successContainer: { 
    flex: 1, 
    backgroundColor: '#f8f4ff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  successCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 24, 
    padding: 24, 
    width: '100%', 
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6b46c1',
    opacity: 0.2,
    marginBottom: 8,
  },
  successTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#0f172a', 
    textAlign: 'center', 
    marginTop: 12 
  },
  successMessage: { 
    fontSize: 14, 
    color: '#64748b', 
    textAlign: 'center', 
    lineHeight: 20, 
    marginTop: 8, 
    marginBottom: 20 
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
    borderColor: '#cbd5e1' 
  },
  receiptLabel: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#64748b', 
    letterSpacing: 1 
  },
  receiptValue: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#6b46c1', 
    marginTop: 4 
  },
  receiptSubtext: { 
    fontSize: 12, 
    color: '#94a3b8', 
    marginTop: 8 
  },
  successBtn: { 
    backgroundColor: '#6b46c1', 
    paddingVertical: 14, 
    borderRadius: 14, 
    alignItems: 'center', 
    width: '100%' 
  },
  successBtnText: { 
    color: '#ffffff', 
    fontSize: 15, 
    fontWeight: '600' 
  },
});