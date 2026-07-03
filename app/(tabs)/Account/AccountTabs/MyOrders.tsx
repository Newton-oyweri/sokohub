// app/(tabs)/Account/AccountTabs/MyOrders.tsx
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

interface Order {
  id: string;
  order_number: string;
  product_id: string;
  customer_id: string;
  seller_id: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  notes: any;
  created_at: string;
  updated_at: string;
  delivery_person_id: string | null;
  products?: {
    id: string;
    name: string;
    price: number;
    image_urls: string[];
    seller_id: string;
  };
}

export default function MyOrders({ onBack }: { onBack: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchOrders(user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error getting user:', error);
      setLoading(false);
    }
  };

  const fetchOrders = async (uid: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            name,
            price,
            image_urls,
            seller_id
          )
        `)
        .eq('customer_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (userId) {
      setRefreshing(true);
      fetchOrders(userId);
    }
  };

  // Updated Status Config
  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: 'Pending', color: '#f59e0b' },
      accepted: { label: 'Accepted', color: '#3b82f6' },
      in_progress: { label: 'In Progress', color: '#8b5cf6' },
      ready: { label: 'Ready', color: '#06b6d4' },
      pickup: { label: 'Ready for Pickup', color: '#06b6d4' },
      delivered: { label: 'Delivered', color: '#10b981' },
      cancelled: { label: 'Cancelled', color: '#ef4444' },
    };
    return statusMap[status] || { label: status, color: '#64748b' };
  };

  // Restrict ONLY cancelled orders from tracking
  const isTrackable = (status: string) => status !== 'cancelled';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderOrderItem = (item: Order) => {
    const statusConfig = getStatusConfig(item.status);
    const productName = item.products?.name || 'Unknown Product';
    const imageUrl = item.products?.image_urls?.[0];

    return (
      <View style={styles.orderCard} key={item.id}>
        {/* Card Header: ID & Date */}
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>{item.order_number || item.id.slice(0, 8)}</Text>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>

        <View style={styles.cardContent}>
          {/* Product Image */}
        {imageUrl && (
  <Image
    source={{ uri: imageUrl }}
    style={styles.productImage}
  />
)}
          {/* Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.productName} numberOfLines={1}>
              {productName}
            </Text>
            <Text style={styles.priceText}>KSh {item.total_amount}</Text>

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Dynamic Action Footer */}
        <View style={styles.cardFooter}>
          {isTrackable(item.status) ? (
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                item.status === 'delivered' ? styles.secondaryActionButton : styles.primaryActionButton
              ]}
              onPress={() => {
                router.push({
                  pathname: '../trackorder',
                  params: { 
                    orderId: item.id,
                    orderNumber: item.order_number,
                  }
                });
              }}
            >
              <Ionicons 
                name={item.status === 'delivered' ? "receipt-outline" : "map-outline"} 
                size={16} 
                color={item.status === 'delivered' ? "#6b46c1" : "#fff"} 
                style={styles.btnIcon} 
              />
              <Text style={item.status === 'delivered' ? styles.secondaryActionText : styles.primaryActionText}>
           {item.status === 'delivered' ? 'Treat Delivered ' : 'Track My Treat'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.actionButton, styles.cancelledActionButton]}>
              <Ionicons name="close-circle-outline" size={16} color="#ef4444" style={styles.btnIcon} />
              <Text style={styles.cancelledActionText}>Order Cancelled</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order History</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6b46c1" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
      </View>

      <ScrollView
        style={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {orders.map((item) => renderOrderItem(item))}
        
        {orders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyText}>No orders found yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1f2937', marginLeft: 12 },
  listContent: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#64748b' },
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
  orderId: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  orderDate: { fontSize: 13, color: '#94a3b8' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  productImage: { width: 76, height: 76, borderRadius: 14, backgroundColor: '#f1f5f9' },
  detailsContainer: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  priceText: { fontSize: 15, fontWeight: '600', color: '#6b46c1', marginBottom: 8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '700' },
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
  btnIcon: { marginRight: 6 },
  primaryActionButton: { backgroundColor: '#6b46c1' },
  primaryActionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  secondaryActionButton: { backgroundColor: '#f3e8ff' },
  secondaryActionText: { color: '#6b46c1', fontSize: 14, fontWeight: '600' },
  cancelledActionButton: { backgroundColor: '#fef2f2' },
  cancelledActionText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#64748b', fontWeight: '500' },
});