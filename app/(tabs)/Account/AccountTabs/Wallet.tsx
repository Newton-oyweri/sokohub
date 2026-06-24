import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../../lib/supabase';

interface WalletScreenProps {
  onBack: () => void;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'PURCHASE';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  reference: string | null;
  description: string | null;
  created_at: string;
}

// UPDATE THIS TO MATCH YOUR CURRENT RUNNING NGROK ENDPOINT
const BACKEND_URL = 'https://neville-interconfessional-enedina.ngrok-free.dev';

export default function Wallet({ onBack }: WalletScreenProps) {
  const insets = useSafeAreaInsets();

  // Core State
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('KES');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userPhone, setUserPhone] = useState<string>('');
  
  // App UI State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isDepositModalVisible, setIsDepositModalVisible] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [isProcessingPush, setIsProcessingPush] = useState<boolean>(false);

  const fetchWalletData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // 1. Fetch user profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', userId)
        .single();

      if (profileData?.phone) {
        setUserPhone(profileData.phone);
      }

      // 2. Fetch wallet metadata and active balance
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('id, balance, currency')
        .eq('user_id', userId)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Wallet doesn't exist, create one
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert([
            {
              user_id: userId,
              balance: 0,
              currency: 'KES'
            }
          ])
          .select('id, balance, currency')
          .single();

        if (createError) throw createError;
        
        if (newWallet) {
          setBalance(Number(newWallet.balance));
          setCurrency(newWallet.currency || 'KES');
          setTransactions([]);
        }
      } else if (walletData) {
        setBalance(Number(walletData.balance));
        setCurrency(walletData.currency || 'KES');

        // 3. Fetch transactions
        const { data: txData } = await supabase
          .from('wallet_transactions')
          .select('id, amount, type, status, reference, description, created_at')
          .eq('wallet_id', walletData.id)
          .order('created_at', { ascending: false })
          .limit(15);

        if (txData) {
          setTransactions(txData as Transaction[]);
        }
      }
    } catch (e) {
      console.error('Error fetching wallet data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWalletData();
  };

  // Helper function to format phone number for backend
  const formatPhoneForBackend = (phone: string) => {
    let cleaned = phone.replace(/\s/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7')) {
      cleaned = '254' + cleaned;
    }
    return cleaned;
  };

  // Handle STK Push payment
  const handleInitiatePayment = async () => {
    const numericAmount = parseFloat(depositAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    if (!userPhone) {
      Alert.alert(
        'Missing Phone Number',
        'Please add your phone number to your profile first.'
      );
      return;
    }

    setIsProcessingPush(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const formattedPhone = formatPhoneForBackend(userPhone);

      const payload = {
        userId: session.user.id,
        amount: numericAmount,
        phone: formattedPhone,
      };

      const response = await fetch(`${BACKEND_URL}/api/stk-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorJson = JSON.parse(text);
          throw new Error(errorJson.error || errorJson.details || 'Server error');
        } catch (parseErr) {
          throw new Error(`Server returned ${response.status}: ${text.substring(0, 100)}`);
        }
      }

      const jsonResult = await response.json();

      // Success
      setIsDepositModalVisible(false);
      setDepositAmount('');
      
      Alert.alert(
        'STK Push Sent!',
        `Check your phone (${userPhone}) for the M-Pesa prompt. Enter your PIN to complete the deposit.`,
        [{ text: 'OK', onPress: () => onRefresh() }]
      );

    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Unable to process payment.');
    } finally {
      setIsProcessingPush(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'SUCCESS': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'FAILED': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6b46c1" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6b46c1']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.currency}>{currency === 'KES' ? 'KSh' : currency}</Text>
            <Text style={styles.balanceAmount}>
              {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.phoneContainer}>
            <Text style={styles.phoneText}>{userPhone || 'No phone linked'}</Text>
          </View>
        </View>

        {/* Deposit Button */}
        <TouchableOpacity 
          style={styles.depositButton} 
          activeOpacity={0.9}
          onPress={() => setIsDepositModalVisible(true)}
        >
          <View style={styles.depositButtonInner}>
            <Ionicons name="arrow-up-circle" size={24} color="#fff" />
            <Text style={styles.depositButtonText}>Deposit via Lipa Na M-Pesa</Text>
          </View>
        </TouchableOpacity>

        {/* Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={20} color="#6b46c1" />
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsContainer}>
          {transactions.length > 0 ? (
            transactions.map((item) => {
              const isDeposit = item.type === 'DEPOSIT';
              return (
                <View key={item.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: isDeposit ? '#ecfdf5' : '#fdf4ff' }
                    ]}>
                      <Ionicons
                        name={isDeposit ? 'wallet-outline' : 'cart-outline'}
                        size={20}
                        color={isDeposit ? '#10b981' : '#c026d3'}
                      />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionDescription} numberOfLines={1}>
                        {item.description || (isDeposit ? 'Funds Deposited' : 'Purchase')}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(item.created_at)}
                      </Text>
                      <Text style={[styles.transactionStatus, { color: getStatusColor(item.status) }]}>
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: isDeposit ? '#10b981' : '#e11dd4' }
                  ]}>
                    {isDeposit ? '+' : '-'} {Math.abs(item.amount).toLocaleString()}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color="#c4b5fd" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Your recent activities will appear here</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Deposit Modal */}
      <Modal
        visible={isDepositModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isProcessingPush && setIsDepositModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => !isProcessingPush && setIsDepositModalVisible(false)}
          />
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Deposit Funds</Text>
              <TouchableOpacity 
                disabled={isProcessingPush} 
                onPress={() => setIsDepositModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Enter Amount (KSh)</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="500"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
              editable={!isProcessingPush}
              autoFocus={true}
            />

            <View style={styles.phoneInfoBox}>
              <Text style={styles.phoneInfoText}>
                Phone: <Text style={styles.phoneInfoValue}>{userPhone || 'No phone'}</Text>
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isProcessingPush && styles.submitButtonDisabled]}
              onPress={handleInitiatePayment}
              disabled={isProcessingPush}
            >
              {isProcessingPush ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b46c1',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8,
  },
  balanceCard: {
    backgroundColor: '#6b46c1',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: '#e9d5ff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e9d5ff',
    marginRight: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  phoneText: {
    fontSize: 13,
    color: '#f3e8ff',
    fontWeight: '500',
  },
  depositButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  depositButtonInner: {
    backgroundColor: '#6b46c1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 16,
  },
  depositButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  transactionStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 16,
  },
  phoneInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  phoneInfoText: {
    fontSize: 14,
    color: '#4b5563',
  },
  phoneInfoValue: {
    fontWeight: '700',
    color: '#1f2937',
  },
  submitButton: {
    backgroundColor: '#6b46c1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#a78bfa',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});