// app/(tabs)/Account/AccountTabs/TrackOrder.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TrackOrderProps {
  onBack: () => void;
  orderId?: string;
}

// 4 Progressive Delivery Stages
const TRACKING_STEPS = [
  {
    title: 'Order Confirmed',
    description: 'We have received your payment & cake choice.',
    icon: 'checkmark-circle-outline',
  },
  {
    title: 'Baking & Preparing',
    description: 'The kitchen is putting together your Red Velvet Magic.',
    icon: 'flame-outline',
  },
  {
    title: 'Out for Delivery',
    description: 'Rider is en route to K.U. Main Campus.',
    icon: 'bicycle-outline',
  },
  {
    title: 'Delivered',
    description: 'Enjoy your fresh cake!',
    icon: 'gift-outline',
  },
];

export default function TrackOrder({ onBack, orderId = 'ORD-7841' }: TrackOrderProps) {
  const insets = useSafeAreaInsets();
  
  // Current step state (0 = Confirmed, 1 = Preparing, 2 = Out for Delivery, 3 = Delivered)
  // Your backend will update this number dynamically over WebSockets or polling later
  const [currentStep, setCurrentStep] = useState(1);

  const riderName = 'Mwangi J.';
  const riderPhone = '+254712345678'; 

  const handleCallRider = () => {
    Linking.openURL(`tel:${riderPhone}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#1f2937" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.headerSubtitle}>{orderId}</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
      >
        {/* Estimated Time Banner */}
        <View style={styles.etaCard}>
          <View style={styles.etaLeft}>
            <Text style={styles.etaLabel}>Estimated Delivery</Text>
            <Text style={styles.etaTime}>25 - 35 Mins</Text>
          </View>
          <View style={styles.etaBadge}>
            <Ionicons name="time" size={20} color="#6b46c1" />
          </View>
        </View>

        {/* PROGRESSIVE TIMELINE FLOW */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardTitle}>Delivery Status</Text>

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

                {/* Floating Aspect Context Icon */}
                <Ionicons 
                  name={step.icon as any} 
                  size={22} 
                  color={isDone ? '#6b46c1' : '#cbd5e1'} 
                  style={styles.stepSideIcon}
                />
              </View>
            );
          })}
        </View>

        {/* RIDER ASSIGNMENT CARD */}
        {currentStep >= 2 && (
          <View style={styles.riderCard}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={28} color="#6b46c1" />
            </View>
            <View style={styles.riderInfo}>
              <Text style={styles.assignedLabel}>Your Delivery Rider</Text>
              <Text style={styles.riderName}>{riderName}</Text>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={handleCallRider}>
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.callButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* DEMO DEBUG CONTROLLER BUTTON (For backend preview mapping testing) */}
        <View style={styles.devControls}>
          <Text style={styles.devTitle}>Dev Testing Controls</Text>
          <View style={styles.devBtnGroup}>
            <TouchableOpacity 
              style={styles.devBtn} 
              onPress={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            >
              <Text style={styles.devBtnText}>Prev Step</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.devBtn} 
              onPress={() => setCurrentStep(prev => Math.min(3, prev + 1))}
            >
              <Text style={styles.devBtnText}>Next Step</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  etaCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  etaLeft: {
    flex: 1,
  },
  etaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  etaTime: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: 4,
  },
  etaBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
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
  stepSideIcon: {
    marginLeft: 8,
    opacity: 0.8,
  },
  riderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0d9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  riderInfo: {
    flex: 1,
  },
  assignedLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  riderName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 2,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
  },
  devControls: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
  },
  devTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 10,
  },
  devBtnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  devBtn: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  devBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
});