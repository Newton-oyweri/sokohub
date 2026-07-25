import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import ServiceCard from './ServiceCard';
import {
  ServiceItem,
  fetchAllAvailableServices,
  fetchUserProfilePhone,
  createCallbackRequest,
  createCustomTaskRequest,
} from './api.services';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  onSelectService?: (service: ServiceItem) => void;
  sellerId?: string;
};

type ToastState = {
  type: 'success' | 'error';
  message: string;
} | null;

type ConfirmModalState = {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
} | null;

export default function Services({ onSelectService, sellerId }: Props) {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customTask, setCustomTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingCustom, setSubmittingCustom] = useState(false);

  // Accordion State
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form Inputs
  const [userPhone, setUserPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Toast State
  const [toast, setToast] = useState<ToastState>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<ConfirmModalState>(null);

  useEffect(() => {
    loadServices();
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (!toast) return;
    Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setToast(null);
      });
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
  };

  const showConfirmModal = (
    title: string,
    message: string,
    confirmText: string,
    onConfirm: () => void
  ) => {
    setModalConfig({
      visible: true,
      title,
      message,
      confirmText,
      onConfirm,
    });
  };

  const closeModal = () => setModalConfig(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await fetchAllAvailableServices();
      setServices(data);
    } catch (err: any) {
      showToast('error', 'Unable to load services.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    const phone = await fetchUserProfilePhone();
    if (phone) setUserPhone(phone);
  };

  const toggleExpand = (id: string) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setNotes('');
    }
  };

  const validateFields = (): string | null => {
    if (!userPhone.trim()) {
      return 'Please enter a phone number so we can reach you.';
    }
    const digitsOnly = userPhone.trim().replace(/[^0-9+]/g, '');
    if (digitsOnly.length < 9) {
      return 'That phone number looks too short. Please double-check it.';
    }
    if (!notes.trim()) {
      return 'Please add a few details about what you need before requesting a callback.';
    }
    return null;
  };

  const handleRequestCallback = async (item: ServiceItem) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      showConfirmModal(
        'Authentication Required',
        'Please log in to submit requests.',
        'Sign In',
        () => router.push('/auth')
      );
      return;
    }

    const validationError = validateFields();
    if (validationError) {
      showToast('error', validationError);
      return;
    }

    showConfirmModal(
      'Confirm Callback Request',
      `We'll call ${userPhone.trim()} about "${item.name}".\n\nNote: ${notes.trim()}`,
      'Send Request',
      () => submitCallback(item, session.user.id)
    );
  };

  const submitCallback = async (item: ServiceItem, uid: string) => {
    setSubmittingAction(true);
    try {
      await createCallbackRequest({
        userId: uid,
        sellerId: item.seller_id || sellerId,
        serviceId: item.id,
        serviceName: item.name,
        amount: item.price,
        userPhone: userPhone.trim(),
        notes: notes.trim(),
      });

      showToast('success', `We'll call you shortly regarding "${item.name}".`);
      setExpandedId(null);
      setNotes('');
    } catch (err: any) {
      showToast('error', err.message || 'Could not process callback request.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleCustomTask = async () => {
    const taskText = customTask.trim();
    if (!taskText) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showConfirmModal(
        'Authentication Required',
        'Please log in to submit custom task requests.',
        'Sign In',
        () => router.push('/auth')
      );
      return;
    }

    if (!userPhone.trim()) {
      showToast('error', 'Please add a phone number so we can reach you.');
      return;
    }

    showConfirmModal(
      'Confirm Custom Task Request',
      `Send request for: "${taskText}"?\n\nWe will call ${userPhone.trim()} to discuss details and timing.`,
      'Submit Request',
      () => submitCustomTask(taskText, session.user.id)
    );
  };

  const submitCustomTask = async (taskText: string, uid: string) => {
    setSubmittingCustom(true);
    try {
      await createCustomTaskRequest({
        userId: uid,
        sellerId: sellerId,
        taskText,
        userPhone: userPhone.trim(),
      });

      showToast('success', 'Your custom task request has been received!');
      setCustomTask('');
    } catch (err: any) {
      showToast('error', err.message || 'Could not submit custom task.');
    } finally {
      setSubmittingCustom(false);
    }
  };

  const renderHeader = () => (
    <View>
      <Text style={styles.heading}>Services</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ How it works</Text>
        <Text style={styles.infoText}>
          Prices shown are <Text style={styles.bold}>one-time starting rates</Text>. Request a callback and we'll confirm details and pricing with you directly.
        </Text>
      </View>
      <Text style={styles.subheading}>Tap a service to expand and request a callback.</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.customTaskContainer}>
      <Text style={styles.customTaskTitle}>Don't see what you need?</Text>
      <Text style={styles.customTaskSubtitle}>Describe your custom task and request a quote:</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g. Assemble IKEA furniture..."
          placeholderTextColor="#9CA3AF"
          value={customTask}
          onChangeText={setCustomTask}
        />
        <TouchableOpacity
          style={[styles.submitButton, (!customTask.trim() || submittingCustom) && styles.disabledButton]}
          disabled={!customTask.trim() || submittingCustom}
          onPress={handleCustomTask}
        >
          {submittingCustom ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Request</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={styles.loaderText}>Loading live services...</Text>
      </View>
    );
  }

  const content = (
    <View style={styles.mainWrapper}>
      {/* Screen-Centered Toast Banner */}
      {toast && (
        <View style={styles.centerToastOverlay} pointerEvents="none">
          <Animated.View
            style={[
              styles.toast,
              toast.type === 'success' ? styles.toastSuccess : styles.toastError,
              { opacity: toastOpacity },
            ]}
          >
            <Ionicons
              name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.toastText}>{toast.message}</Text>
          </Animated.View>
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={!!modalConfig?.visible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderIcon}>
              <Ionicons name="help-circle-outline" size={32} color="#6B46C1" />
            </View>
            <Text style={styles.modalTitle}>{modalConfig?.title}</Text>
            <Text style={styles.modalMessage}>{modalConfig?.message}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} activeOpacity={0.7} onPress={closeModal}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                activeOpacity={0.8}
                onPress={() => {
                  const cb = modalConfig?.onConfirm;
                  closeModal();
                  cb?.();
                }}
              >
                <Text style={styles.modalConfirmText}>{modalConfig?.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard
            item={item}
            isExpanded={expandedId === item.id}
            userPhone={userPhone}
            notes={notes}
            submittingAction={submittingAction}
            onToggleExpand={() => {
              toggleExpand(item.id);
              onSelectService?.(item);
            }}
            onPhoneChange={setUserPhone}
            onNotesChange={setNotes}
            onRequestCallback={() => handleRequestCallback(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );

  if (Platform.OS === 'web') {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {content}
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F9FAFB', flex: 1 },
  mainWrapper: { flex: 1, position: 'relative' },
  loaderContainer: { paddingVertical: 50, alignItems: 'center', justifyContent: 'center' },
  loaderText: { marginTop: 10, fontSize: 14, color: '#6B7280' },
  listContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  infoCard: { marginTop: 12, marginBottom: 14, padding: 14, borderRadius: 12, backgroundColor: '#F8F5FF', borderWidth: 1, borderColor: '#E9D8FD' },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#6B46C1', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  bold: { fontWeight: '700', color: '#1F2937' },
  subheading: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  customTaskContainer: { marginTop: 16, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  customTaskTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  customTaskSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2, marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, height: 44, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: '#1F2937', backgroundColor: '#FAFAFA' },
  submitButton: { height: 44, paddingHorizontal: 16, backgroundColor: '#6B46C1', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#C4B5FD' },
  submitButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  // Screen-Centered Floating Warning / Toast Overlay
  centerToastOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    maxWidth: 360,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  toastSuccess: { backgroundColor: '#15803D' },
  toastError: { backgroundColor: '#B91C1C' },
  toastText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'center' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeaderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
  modalMessage: { fontSize: 13, color: '#4B5563', textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  modalActions: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  modalCancelBtn: { flex: 1, height: 42, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  modalConfirmBtn: { flex: 1, height: 42, borderRadius: 8, backgroundColor: '#6B46C1', justifyContent: 'center', alignItems: 'center' },
  modalConfirmText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});

