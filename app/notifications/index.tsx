// app/notifications/index.tsx (PAGE VERSION)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface CakeNotification {
  id: string;
  orderId: string;
  cakeName: string;
  status: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
}

const initialNotifications: CakeNotification[] = [
  {
    id: 'notif-3',
    orderId: '#CK-8042',
    cakeName: 'Strawberry Bliss Cake',
    status: 'delivered',
    title: '🎉 Cake Delivered!',
    body: 'Your Strawberry Bliss Cake was safely handed over. Enjoy your sweet treat!',
    time: 'Yesterday, 4:15 PM',
    isRead: true,
  },
  {
    id: 'notif-2',
    orderId: '#CK-8042',
    cakeName: 'Strawberry Bliss Cake',
    status: 'transit',
    title: '🚚 Out for Delivery',
    body: 'Your rider is heading your way. Keep your phone close!',
    time: 'Yesterday, 3:40 PM',
    isRead: false,
  },
  {
    id: 'notif-1',
    orderId: '#CK-8042',
    cakeName: 'Strawberry Bliss Cake',
    status: 'confirmed',
    title: '💳 Order Confirmed',
    body: 'Payment received! Our chefs are preparing your custom layout ingredients.',
    time: 'Yesterday, 2:00 PM',
    isRead: true,
  },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<CakeNotification[]>(initialNotifications);
  const [simStep, setSimStep] = useState(0);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notif) => {
      const incomingData = notif.request.content.data || {};

      const newNotif: CakeNotification = {
        id: Date.now().toString(),
        orderId: typeof incomingData.orderId === 'string' ? incomingData.orderId : '#CK-9915',
        cakeName: typeof incomingData.cakeName === 'string' ? incomingData.cakeName : 'Chocolate Dream',
        status: typeof incomingData.status === 'string' ? incomingData.status : 'processing',
        title: notif.request.content.title || 'Update',
        body: notif.request.content.body || '',
        time: 'Just Now',
        isRead: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => subscription.remove();
  }, []);

  const toggleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const simulateOrderTimeline = async () => {
    let title = '';
    let body = '';
    let status = '';

    switch (simStep) {
      case 0:
        title = '🥣 Order #CK-9915 is Baking!';
        body = 'Chef Kamau just put your Chocolate Dream base layer into the oven.';
        status = 'baking';
        setSimStep(1);
        break;
      case 1:
        title = '✨ Freshly Frosted (#CK-9915)';
        body = 'Decorators are applying the signature violet vanilla icing right now!';
        status = 'decorating';
        setSimStep(2);
        break;
      case 2:
        title = '🚚 Dispatch Ready (#CK-9915)';
        body = 'Your cake is boxed up safely and waiting for the courier pickup.';
        status = 'transit';
        setSimStep(0);
        break;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { orderId: '#CK-9915', cakeName: 'Chocolate Dream', status },
        },
        trigger: null,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'delivered': return { icon: 'check-circle-outline', color: '#10B981', bg: '#E6F4EA' };
      case 'transit': return { icon: 'motorbike', color: '#3B82F6', bg: '#E8F0FE' };
      case 'baking': return { icon: 'stove', color: '#F59E0B', bg: '#FEF3C7' };
      case 'decorating': return { icon: 'auto-fix', color: '#EC4899', bg: '#FCE7F3' };
      default: return { icon: 'clipboard-text-outline', color: '#6B46C1', bg: '#F3E8FF' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <MaterialCommunityIcons name="clock-fast" size={24} color="#6b46c1" />
          <Text style={styles.title}>My activity</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadCountBadge}>
              <Text style={styles.unreadCountText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Test Button */}
      <TouchableOpacity style={styles.testButton} onPress={simulateOrderTimeline}>
        <Text style={styles.testButtonText}>
          {simStep === 0 ? '👩‍🍳 Start Baking Order #CK-9915' : `⚡ Push Status Update (Stage ${simStep})`}
        </Text>
      </TouchableOpacity>

      {/* Scrollable Feed List */}
      <ScrollView 
        style={styles.list} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.map((item) => {
          const meta = getStatusMeta(item.status);
          return (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.notifCard, 
                !item.isRead && styles.unreadCardBorder
              ]}
              onPress={() => toggleMarkAsRead(item.id)}
              activeOpacity={0.7}
            >
              {/* Top Context Header */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.orderLabelGroup}>
                  <Text style={[styles.orderIdText, item.isRead && styles.dimmedText]}>
                    {item.orderId}
                  </Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={[styles.cakeNameText, item.isRead && styles.dimmedText]} numberOfLines={1}>
                    {item.cakeName}
                  </Text>
                </View>
                
                {/* Unread Action Indicator Tag */}
                {!item.isRead ? (
                  <View style={styles.newIndicatorTag}>
                    <Text style={styles.newIndicatorText}>NEW</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <MaterialCommunityIcons name={meta.icon as any} size={12} color={meta.color} />
                    <Text style={[styles.statusBadgeText, { color: meta.color }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Body Text Blocks */}
              <View style={[styles.cardBodyContent, item.isRead && styles.dimmedBodyOpacity]}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifBody}>{item.body}</Text>
                
                <View style={styles.footerRow}>
                  {!item.isRead && (
                    <Text style={styles.tapPrompt}>Tap to mark as read</Text>
                  )}
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  unreadCountBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
    marginLeft: 4,
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  markAllText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#6b46c1',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notifCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadCardBorder: {
    borderColor: '#c084fc',
    backgroundColor: '#faf5ff',
    elevation: 5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 8,
    marginBottom: 10,
  },
  orderLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b46c1',
  },
  dotSeparator: {
    marginHorizontal: 6,
    color: '#94a3b8',
  },
  cakeNameText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  dimmedText: {
    color: '#94a3b8',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  newIndicatorTag: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  newIndicatorText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardBodyContent: {
    paddingHorizontal: 2,
  },
  dimmedBodyOpacity: {
    opacity: 0.6,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  notifBody: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  tapPrompt: {
    fontSize: 11,
    color: '#a855f7',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  notifTime: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginLeft: 'auto',
  },
});