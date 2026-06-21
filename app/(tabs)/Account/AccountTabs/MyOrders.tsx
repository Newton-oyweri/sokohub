// app/(tabs)/Account/AccountTabs/MyOrders.tsx
import React from 'react';
import { router } from 'expo-router';


import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const orders = [
  {
    id: 'ORD-7842',
    cakeName: 'Red Velvet Magic',
    price: 600,
    date: 'Jun 19, 2026',
    status: 'Delivered',
    statusColor: '#10b981',
    image: require('../../../../assets/images/town.png'),
  },
  {
    id: 'ORD-7841',
    cakeName: 'Chocolate Dream',
    price: 450,
    date: 'Jun 18, 2026',
    status: 'Processing',
    statusColor: '#f59e0b',
    image: require('../../../../assets/images/cake.png'),
  },
  {
    id: 'ORD-7840',
    cakeName: 'Strawberry Shortcake',
    price: 550,
    date: 'Jun 17, 2026',
    status: 'Delivered',
    statusColor: '#10b981',
    image: require('../../../../assets/images/moist.png'),
  },
  {
    id: 'ORD-7839',
    cakeName: 'Blueberry Cheesecake',
    price: 650,
    date: 'Jun 16, 2026',
    status: 'Cancelled',
    statusColor: '#ef4444',
    image: require('../../../../assets/images/town.png'),
  },
];

export default function MyOrders({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();

  const renderOrderItem = ({ item }: { item: typeof orders[0] }) => {
    return (
      <View style={styles.orderCard}>
        {/* Card Header: ID & Date */}
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>{item.id}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>

        <View style={styles.cardContent}>
          {/* Cake Image */}
          <Image source={item.image} style={styles.cakeImage} />

          {/* Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.cakeName} numberOfLines={1}>
              {item.cakeName}
            </Text>
            <Text style={styles.priceText}>KSh {item.price}</Text>

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: `${item.statusColor}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: item.statusColor }]} />
              <Text style={[styles.statusText, { color: item.statusColor }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>


{/* Dynamic Action Footer */}
<View style={styles.cardFooter}>
  {item.status === 'Processing' ? (
    <TouchableOpacity 
      style={[styles.actionButton, styles.primaryActionButton]}
      onPress={() => {
        // Pushes the user to your TrackOrder screen, passing the Order ID as a parameter
        router.push({
          pathname: '../trackorder',
          params: { id: item.id }
        });
      }}
    >
      <Ionicons name="map-outline" size={16} color="#fff" style={styles.btnIcon} />
      <Text style={styles.primaryActionText}>Track Live</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity style={[styles.actionButton, styles.secondaryActionButton]}>
      <Ionicons name="receipt-outline" size={16} color="#6b46c1" style={styles.btnIcon} />
      <Text style={styles.secondaryActionText}>Order Completed</Text>
    </TouchableOpacity>
  )}
</View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Header Layout */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyText}>No orders found yet</Text>
          </View>
        }
      />
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
    marginBottom: 16,
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
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  orderDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cakeImage: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  cakeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b46c1',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardFooter: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
  },
  btnIcon: {
    marginRight: 6,
  },
  primaryActionButton: {
    backgroundColor: '#6b46c1',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryActionButton: {
    backgroundColor: '#f3e8ff',
  },
  secondaryActionText: {
    color: '#6b46c1',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});