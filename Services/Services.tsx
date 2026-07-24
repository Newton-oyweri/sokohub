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
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function formatKES(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

export interface ServiceItem {
  id: string;
  seller_id?: string;
  name: string;
  price: number;
  description?: string;
  image_urls?: string[] | null;
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

  const closeModal = () => {
    setModalConfig(null);
  };

  // 1. Fetch live services
  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, seller_id, name, price, description, image_urls')
        .eq('post_type', 'booking')
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setServices((data as ServiceItem[]) || []);
    } catch (err: any) {
      showToast('error', 'Unable to load services.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch logged-in user profile phone
  const loadUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!error && data?.phone) {
      setUserPhone(data.phone);
    }
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

  // 3. Request Callback for Existing Service
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
      const { error } = await supabase.from('service_requests').insert([
        {
          user_id: uid,
          seller_id: item.seller_id || sellerId || null,
          service_id: item.id,
          service_name: item.name,
          amount: item.price,
          request_type: 'callback',
          status: 'pending',
          user_phone: userPhone.trim(),
          notes: notes.trim(),
        },
      ]);

      if (error) throw error;

      showToast('success', `We'll call you shortly regarding "${item.name}".`);
      setExpandedId(null);
      setNotes('');
    } catch (err: any) {
      showToast('error', err.message || 'Could not process callback request.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // 4. Submit Custom Unlisted Task -> directly into `service_requests`
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
      const { error } = await supabase.from('service_requests').insert([
        {
          user_id: uid,
          seller_id: sellerId || null,
          service_id: null,
          service_name: taskText,
          amount: null,
          request_type: 'custom_task',
          status: 'pending',
          user_phone: userPhone.trim(),
          notes: taskText,
        },
      ]);

      if (error) throw error;

      showToast('success', 'Your custom task request has been received!');
      setCustomTask('');
    } catch (err: any) {
      showToast('error', err.message || 'Could not submit custom task.');
    } finally {
      setSubmittingCustom(false);
    }
  };

  const renderItem = ({ item }: { item: ServiceItem }) => {
    const isExpanded = expandedId === item.id;
    const imageUrl = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            toggleExpand(item.id);
            onSelectService?.(item);
          }}
        >
          {/* Large Hero Service Image (Only rendered if an image exists) */}
          {imageUrl ? (
            <View style={styles.imageBannerContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* Header Row: Title & Price */}
          <View style={styles.row}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{item.name}</Text>
            </View>

            <View style={styles.rightHeaderWrap}>
              <View style={styles.priceWrap}>
                <Text style={styles.priceLabel}>Starting from</Text>
                <Text style={styles.priceValue}>{formatKES(item.price)}</Text>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#6B7280"
                style={{ marginLeft: 8 }}
              />
            </View>
          </View>

          {/* Service Description: Truncated when collapsed, Full when expanded */}
          {item.description ? (
            <View style={styles.descriptionContainer}>
              <Text
                style={styles.description}
                numberOfLines={isExpanded ? undefined : 2}
              >
                {item.description}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>

        {/* Expanded Form Section */}
        {isExpanded && (
          <View style={styles.expandedContainer}>
            <TextInput
              style={styles.formInput}
              placeholder="Phone number for callback..."
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={userPhone}
              onChangeText={setUserPhone}
            />

            <TextInput
              style={[styles.formInput, styles.textArea]}
              placeholder="Add specific details or instructions..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={2}
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity
              style={styles.callbackBtn}
              disabled={submittingAction}
              onPress={() => handleRequestCallback(item)}
            >
              {submittingAction ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="call-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.btnText}>Request Callback</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
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

  return (
    <View style={styles.container}>
      {toast && (
        <Animated.View
          style={[
            styles.toast,
            toast.type === 'success' ? styles.toastSuccess : styles.toastError,
            { opacity: toastOpacity },
          ]}
        >
          <Ionicons
            name={toast.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}

      {/* Modern Cross-Platform Confirmation Modal */}
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
              <TouchableOpacity
                style={styles.modalCancelBtn}
                activeOpacity={0.7}
                onPress={closeModal}
              >
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
  renderItem={renderItem}
  ListHeaderComponent={renderHeader}
  ListFooterComponent={renderFooter}
  contentContainerStyle={styles.listContent}
  scrollEnabled={Platform.OS === 'web'} // <-- ADD THIS
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#F9FAFB', flex: 1 },
  loaderContainer: { paddingVertical: 50, alignItems: 'center', justifyContent: 'center' },
  loaderText: { marginTop: 10, fontSize: 14, color: '#6B7280' },
  listContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  infoCard: { marginTop: 12, marginBottom: 14, padding: 14, borderRadius: 12, backgroundColor: '#F8F5FF', borderWidth: 1, borderColor: '#E9D8FD' },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#6B46C1', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  bold: { fontWeight: '700', color: '#1F2937' },
  subheading: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  
  // Large Hero Image Display
  imageBannerContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, paddingHorizontal: 16 },
  nameContainer: { flex: 1, marginRight: 10 },
  name: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  descriptionContainer: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14 },
  description: { fontSize: 13, color: '#4B5563', lineHeight: 19 },
  rightHeaderWrap: { flexDirection: 'row', alignItems: 'center' },
  priceWrap: { alignItems: 'flex-end' },
  priceLabel: { fontSize: 10, color: '#9CA3AF' },
  priceValue: { fontSize: 15, fontWeight: '700', color: '#6B46C1', marginTop: 1 },
  expandedContainer: { padding: 14, backgroundColor: '#FAF5FF', borderTopWidth: 1, borderTopColor: '#F3E8FF' },
  formInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9D8FD', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#1F2937', marginBottom: 8 },
  textArea: { height: 52, textAlignVertical: 'top' },
  callbackBtn: { height: 40, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#6B46C1', marginTop: 4 },
  btnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  customTaskContainer: { marginTop: 16, padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  customTaskTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  customTaskSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2, marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, height: 44, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: '#1F2937', backgroundColor: '#FAFAFA' },
  submitButton: { height: 44, paddingHorizontal: 16, backgroundColor: '#6B46C1', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#C4B5FD' },
  submitButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  toast: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  toastSuccess: { backgroundColor: '#16A34A' },
  toastError: { backgroundColor: '#DC2626' },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', flex: 1 },

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
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

