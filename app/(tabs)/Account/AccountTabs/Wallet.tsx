import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../../lib/supabase';

// Import components
import { DepositModal } from './wallet/components/Deposit';
import { TransactionList } from './wallet/components/transactions';

// Import types
import { Transaction, WalletScreenProps } from '../../../../components/wallet.types';

// Import services
import { walletService } from './wallet/services/walletService';

const BACKEND_URL = 'https://sokohubbackend.onrender.com';

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
      const walletData = await walletService.getWalletData(userId);
      
      if (walletData) {
        setBalance(walletData.balance);
        setCurrency(walletData.currency);
        setTransactions(walletData.transactions);
        setUserPhone(walletData.userPhone);
      }
    } catch (e) {
      console.error('Error fetching wallet data:', e);
      Alert.alert('Error', 'Failed to load wallet data. Please try again.');
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

  const handleDeposit = async (amount: number) => {
    setIsProcessingPush(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const result = await walletService.initiateSTKPush({
        userId: session.user.id,
        amount: amount,
        phone: userPhone,
        backendUrl: BACKEND_URL
      });

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

        {/* Transactions Section */}
        <TransactionList 
          transactions={transactions}
          onRefresh={onRefresh}
          formatDate={formatDate}
        />
      </ScrollView>

      {/* Deposit Modal */}
      <DepositModal
        visible={isDepositModalVisible}
        onClose={() => setIsDepositModalVisible(false)}
        onDeposit={handleDeposit}
        userPhone={userPhone}
        isProcessing={isProcessingPush}
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
      />
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
});