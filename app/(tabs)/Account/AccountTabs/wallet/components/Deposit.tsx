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
  Dimensions,
  Image,
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

const { height } = Dimensions.get('window');

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
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1} 
          onPress={onClose}
          disabled={isProcessing}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.modalContent, { 
            paddingTop: insets.top + 20,
            paddingBottom: Math.max(insets.bottom, 24) 
          }]}>
            {/* M-PESA Header */}
            <View style={styles.mpesaHeader}>
              <View style={styles.mpesaHeaderLeft}>
                <View>
                  <Text style={styles.mpesaTitle}>M-PESA</Text>
                  <Text style={styles.mpesaSubtitle}>Wonderbakes Transfer</Text>
                </View>
              </View>
              <TouchableOpacity 
                disabled={isProcessing} 
                onPress={onClose}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

    

            <View style={styles.contentWrapper}>
              {/* Amount Input Section */}
              <View style={styles.amountSection}>
                <Text style={styles.amountLabel}>Enter Amount</Text>
                <View style={styles.amountInputWrapper}>
                  <Text style={styles.currencySymbol}>KSh</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={depositAmount}
                    onChangeText={setDepositAmount}
                    editable={!isProcessing}
                    autoFocus={true}
                  />
                </View>
              </View>

              {/* Phone Information */}
              <View style={styles.phoneSection}>
                <View style={styles.phoneInfoBox}>
                <View>
                    <Text style={styles.phoneLabel}>Sending to</Text>
                    <Text style={styles.phoneValue}>
                      {userPhone || 'No phone number linked'}
                    </Text>
                  </View>
             
                </View>
                
                {!userPhone && (
                  <View style={styles.warningBox}>
                    <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                    <Text style={styles.warningText}>
                      Update your phone number in profile to deposit
                    </Text>
                  </View>
                )}
              </View>

              {/* Instruction Section */}
              <View style={styles.instructionBox}>
                <Ionicons name="information-circle" size={20} color="#6b46c1" />
                <Text style={styles.instructionText}>
                  You will receive a prompt on your M-PESA registered phone to confirm this transaction
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  isProcessing && styles.submitButtonProcessing,
                  (!userPhone || !depositAmount || parseFloat(depositAmount) <= 0) && styles.submitButtonDisabled
                ]}
                onPress={handleDeposit}
                disabled={isProcessing || !userPhone || !depositAmount || parseFloat(depositAmount) <= 0}
              >
                {isProcessing ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.submitButtonText}>
                      Processing...
                    </Text>
                  </View>
                ) : (
                  <>
                   <Text style={styles.submitButtonText}>
                      {!userPhone ? 'Update Phone Number' : 'Pay with M-PESA'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Secured transaction by Safaricom M-PESA
                </Text>
                <View style={styles.footerBadges}>
                  <View style={styles.footerBadge}>
                    <Ionicons name="checkmark" size={12} color="#10b981" />
                    <Text style={styles.footerBadgeText}>Deposited funds remain in your WonderBakes wallet and are intended for purchases on the platform only!</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default DepositModal;

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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    height: height * 0.9,
    justifyContent: 'space-between',
  },
  mpesaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  mpesaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mpesaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mpesaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  mpesaSubtitle: {
    fontSize: 12,
    color: '#6b46c1',
    fontWeight: '600',
    marginTop: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  securityText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
  },
  contentWrapper: {
    flex: 1,
    paddingVertical: 8,
  },
  amountSection: {
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fafafa',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    height: 60,
  },
  phoneSection: {
    marginBottom: 20,
  },
  phoneInfoBox: {
    flexDirection: 'row',
    backgroundColor: '#f8f4ff',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  phoneLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  phoneValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f0f9ff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  instructionText: {
    flex: 1,
    fontSize: 12,
    color: '#0c4a6e',
    lineHeight: 18,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b46c1',
    borderRadius: 16,
    paddingVertical: 16,
    height: 60,
    gap: 10,
    shadowColor: '#6b46c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonProcessing: {
    backgroundColor: '#7c3aed',
    opacity: 0.8,
  },
  submitButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
  mpesaIcon: {
    marginRight: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footer: {
    marginTop: 12,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  footerBadges: {
    flexDirection: 'row',
    gap: 16,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerBadgeText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
});