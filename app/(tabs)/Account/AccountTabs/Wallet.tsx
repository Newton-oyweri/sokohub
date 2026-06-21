// app/(tabs)/Account/AccountTabs/Wallet.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PaymentMethod = 'mpesa' | 'airtel';

export default function Wallet({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  
  // App States
  const [balance, setBalance] = useState(2450); // Current dynamic balance (KSh)
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('0700000000'); // Default user phone
  const [method, setMethod] = useState<PaymentMethod>('mpesa');
  const [isLoading, setIsLoading] = useState(false);

  const quickAmounts = ['200', '500', '1000', '2000'];

  // Handle Push Request to Backend
  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    
    if (!amount || isNaN(depositAmount) || depositAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to deposit.');
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid mobile number.');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Connect your STK Push backend api endpoint here
      // const response = await fetch('https://api.yourstartup.com/wallet/deposit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: depositAmount, phone: phoneNumber, provider: method })
      // });
      
      // Simulating SIM toolkit push delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Mock update to show balance changes instantly
      setBalance(prev => prev + depositAmount);
      setAmount('');
      
      Alert.alert(
        'Request Sent!',
        `Check your phone for the ${method === 'mpesa' ? 'M-Pesa' : 'Airtel'} PIN prompt to complete the deposit.`
      );
    } catch (error) {
      Alert.alert('Transaction Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} disabled={isLoading}>
            <Ionicons name="arrow-back" size={26} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
        </View>

        {/* Balance Display Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>KSh {balance.toLocaleString()}</Text>
          <View style={styles.cardFooter}>
            <Ionicons name="shield-checkmark" size={16} color="#fff" opacity={0.8} />
            <Text style={styles.securedText}>Secured Wallet Statement</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Top Up Wallet</Text>

        {/* Payment Provider Selector */}
        <View style={styles.methodRow}>
          <TouchableOpacity 
            style={[styles.methodCard, method === 'mpesa' && styles.selectedMpesa]} 
            onPress={() => setMethod('mpesa')}
            disabled={isLoading}
          >
            <View style={[styles.radio, method === 'mpesa' && styles.radioActiveMpesa]}>
              {method === 'mpesa' && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.methodName, method === 'mpesa' && styles.textActiveMpesa]}>M-Pesa</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodCard, method === 'airtel' && styles.selectedAirtel]} 
            onPress={() => setMethod('airtel')}
            disabled={isLoading}
          >
            <View style={[styles.radio, method === 'airtel' && styles.radioActiveAirtel]}>
              {method === 'airtel' && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.methodName, method === 'airtel' && styles.textActiveAirtel]}>Airtel Money</Text>
          </TouchableOpacity>
        </View>

        {/* Input Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Amount (KSh)</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount e.g. 500"
            placeholderTextColor="#94a3b8"
            editable={!isLoading}
          />

          {/* Quick Presets */}
          <View style={styles.presetRow}>
            {quickAmounts.map((amt) => (
              <TouchableOpacity 
                key={amt} 
                style={styles.presetBtn} 
                onPress={() => setAmount(amt)}
                disabled={isLoading}
              >
                <Text style={styles.presetText}>+{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Mobile Money Number</Text>
          <TextInput
            style={styles.phoneInput}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="e.g. 0712345678"
            placeholderTextColor="#94a3b8"
            editable={!isLoading}
          />
        </View>

        {/* Action Trigger button */}
        <TouchableOpacity 
          style={[
            styles.depositButton, 
            method === 'mpesa' ? styles.btnMpesa : styles.btnAirtel
          ]} 
          onPress={handleDeposit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.depositButtonText}>
              Pay with {method === 'mpesa' ? 'M-Pesa' : 'Airtel Money'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4ff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 12,
  },
  balanceCard: {
    backgroundColor: '#6b46c1',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 28,
  },
  balanceLabel: {
    color: '#e0d9ff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securedText: {
    color: '#e0d9ff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  methodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedMpesa: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  selectedAirtel: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioActiveMpesa: { borderColor: '#10b981' },
  radioActiveAirtel: { borderColor: '#ef4444' },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  textActiveMpesa: { color: '#15803d' },
  textActiveAirtel: { color: '#b91c1c' },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  presetBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  phoneInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  depositButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  btnMpesa: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  btnAirtel: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  depositButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});