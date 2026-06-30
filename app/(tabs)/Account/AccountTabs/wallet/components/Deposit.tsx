import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
  onDeposit: (amount: number) => Promise<void>;
  userPhone: string;
  isProcessing: boolean;
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  visible,
  onClose,
  onDeposit,
  userPhone,
  isProcessing,
  depositAmount,
  setDepositAmount,
}) => {
  const insets = useSafeAreaInsets();

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      // Handle validation in parent
      return;
    }
    onDeposit(amount);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
          disabled={isProcessing}
        />
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Deposit Funds</Text>
            <TouchableOpacity 
              disabled={isProcessing} 
              onPress={onClose}
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
            editable={!isProcessing}
            autoFocus={true}
          />

          <View style={styles.phoneInfoBox}>
            <Ionicons name="phone-portrait-outline" size={20} color="#6b46c1" />
            <Text style={styles.phoneInfoText}>
              Phone: <Text style={styles.phoneInfoValue}>{userPhone || 'No phone linked'}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton, 
              isProcessing && styles.submitButtonDisabled,
              (!userPhone || !depositAmount) && styles.submitButtonDisabled
            ]}
            onPress={handleDeposit}
            disabled={isProcessing || !userPhone || !depositAmount}
          >
            {isProcessing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.submitButtonText, styles.loadingText]}>
                  Processing...
                </Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>
                {!userPhone ? 'Phone Not Linked' : 'Confirm Deposit'}
              </Text>
            )}
          </TouchableOpacity>

          {!userPhone && (
            <Text style={styles.warningText}>
              Please add a phone number to your profile first
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
  warningText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});