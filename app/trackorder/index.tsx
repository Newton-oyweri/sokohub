// app/(tabs)/Account/AccountTabs/TrackOrder.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  quantity: number;
  created_at: string;
  customer_id: string;
  seller_id: string;
  delivery_person_id: string | null;
  products?: {
    name: string;
    image_urls: string[];
  };
}

// Order status to tracking step mapping aligning with the backend array indices
const getTrackingStep = (status: string): number => {
  const stepMap: Record<string, number> = {
    'pending': 0,
    'accepted': 0,
    'in_progress': 1,
    'ready': 2,        // Baker sent it to delivery point
    'pickup': 3,       // Awaiting pickup at destination
    'delivered': 4,
    'cancelled': -1,
  };
  return stepMap[status] ?? 0;
};

// Get status display config for banners and badges
const getStatusConfig = (status: string) => {
  const statusMap: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: 'Pending', color: '#f59e0b', icon: 'time-outline' },
    accepted: { label: 'Accepted', color: '#3b82f6', icon: 'checkmark-circle-outline' },
    in_progress: { label: 'In Progress', color: '#8b5cf6', icon: 'construct-outline' },
    ready: { label: 'Dispatched', color: '#06b6d4', icon: 'paper-plane-outline' },
    pickup: { label: 'Ready for Pickup', color: '#ec4899', icon: 'location-outline' },
    delivered: { label: 'Delivered', color: '#10b981', icon: 'checkmark-done-outline' },
    cancelled: { label: 'Cancelled', color: '#ef4444', icon: 'close-circle-outline' },
  };
  return statusMap[status] || { label: status, color: '#64748b', icon: 'help-outline' };
};

export default function TrackOrder({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (params.orderId) {
      fetchOrderDetails(params.orderId as string);
    }
  }, [params.orderId]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            name,
            image_urls
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      
      setOrder(data);
      const step = getTrackingStep(data.status);
      setCurrentStep(step);

    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // Tracking steps with explicit context between Ready & Pickup
  const getTrackingSteps = () => {
    const productName = order?.products?.name || 'your order';
    
    return [
      {
        title: 'Order Confirmed',
        description: `Your order for ${productName} has been confirmed.`,
      },
      {
        title: 'Preparing',
        description: `The baker is currently preparing your ${productName}.`,
      },
      {
        title: 'Sent to Delivery Point',
        description: `The vendor has completed your ${productName} and sent it to the delivery point.`,
      },
      {
        title: 'Ready for Pickup',
        description: `Your ${productName} has arrived and is awaiting pickup at your selected destination.`,
      },
      {
        title: 'Delivered',
        description: `Your ${productName} has been successfully picked up and delivered.`,
      },
    ];
  };

  const TRACKING_STEPS = getTrackingSteps();
  const isCancelled = order?.status === 'cancelled';
  const statusConfig = order ? getStatusConfig(order.status) : null;

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <Text style={styles.headerTitle}>Track Order</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b46c1" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Order</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#94a3b8" />
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#1f2937" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.headerSubtitle}>{order.order_number}</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Order Info Card */}
        <View style={styles.orderInfoCard}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Product</Text>
            <Text style={styles.orderInfoValue}>{order.products?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Quantity</Text>
            <Text style={styles.orderInfoValue}>x{order.quantity}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Total</Text>
            <Text style={styles.orderInfoValue}>KSh {order.total_amount}</Text>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Ionicons name={statusConfig?.icon as any} size={14} color={statusConfig?.color} />
              <Text style={[styles.orderInfoValue, { color: statusConfig?.color, marginLeft: 6 }]}>
                {statusConfig?.label}
              </Text>
            </View>
          </View>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderInfoLabel}>Order Date</Text>
            <Text style={styles.orderInfoValue}>
              {new Date(order.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {isCancelled ? (
          <View style={styles.cancelledCard}>
            <Ionicons name="close-circle" size={48} color="#ef4444" />
            <Text style={styles.cancelledTitle}>Order Cancelled</Text>
            <Text style={styles.cancelledDescription}>
              This order has been cancelled. Please contact support if you have any questions.
            </Text>
          </View>
        ) : (
          <>
            {/* Current Status Banner */}
            <View style={[styles.statusBanner, { backgroundColor: `${statusConfig?.color}10` }]}>
              <Ionicons name={statusConfig?.icon as any} size={24} color={statusConfig?.color} />
              <Text style={[styles.statusBannerText, { color: statusConfig?.color }]}>
                Current Status: {statusConfig?.label}
              </Text>
            </View>

            {/* PROGRESSIVE TIMELINE FLOW */}
            <View style={styles.timelineCard}>
              <Text style={styles.cardTitle}>Order Progress</Text>

              {TRACKING_STEPS.map((step, index) => {
                const isDone = index <= currentStep;
                const isCurrent = index === currentStep;
                const isLast = index === TRACKING_STEPS.length - 1;

                return (
                  <View key={index} style={styles.stepRow}>
                    {/* Visual Indicator (Node Dot & Connector Line) */}
                    <View style={styles.indicatorColumn}>
                      <View style={[
                        styles.statusDot,
                        isDone ? styles.dotCompleted : styles.dotPending,
                        isCurrent && styles.dotCurrentActive
                      ]}>
                        {isDone && <Ionicons name="checkmark" size={12} color="#fff" />}
                      </View>
                      {!isLast && (
                        <View style={[
                          styles.connectorLine,
                          index < currentStep ? styles.lineCompleted : styles.linePending
                        ]} />
                      )}
                    </View>

                    {/* Step Metadata text */}
                    <View style={styles.stepTextDetails}>
                      <Text style={[
                        styles.stepTitle,
                        isDone ? styles.textCompleted : styles.textPending,
                        isCurrent && styles.textCurrent
                      ]}>
                        {step.title}
                      </Text>
                      <Text style={styles.stepDescription}>
                        {step.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Order Reference */}
            <View style={styles.referenceCard}>
              <Text style={styles.referenceLabel}>Order Reference</Text>
              <Text style={styles.referenceValue}>{order.order_number}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  orderInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderInfoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  orderInfoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cancelledCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cancelledTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
    marginTop: 12,
  },
  cancelledDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 70,
  },
  indicatorColumn: {
    alignItems: 'center',
    marginRight: 16,
  },
  statusDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    zIndex: 2,
    backgroundColor: '#fff',
  },
  dotCompleted: {
    backgroundColor: '#6b46c1',
    borderColor: '#6b46c1',
  },
  dotPending: {
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  dotCurrentActive: {
    borderColor: '#6b46c1',
    transform: [{ scale: 1.15 }],
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    zIndex: 1,
  },
  lineCompleted: {
    backgroundColor: '#6b46c1',
  },
  linePending: {
    backgroundColor: '#e2e8f0',
  },
  stepTextDetails: {
    flex: 1,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  textCompleted: {
    color: '#1f2937',
  },
  textPending: {
    color: '#94a3b8',
  },
  textCurrent: {
    color: '#6b46c1',
  },
  stepDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  referenceCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  referenceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  referenceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 4,
  },
});