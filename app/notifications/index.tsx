// app/notifications/index.tsx
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
    ActivityIndicator,
    RefreshControl,
    Image,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface CakeNotification {
    id: string;
    orderId: string | null;
    status: string;
    title: string;
    body: string;
    time: string;
    isRead: boolean;
    imageUrl?: string | null;
    productId?: string | null;
    orders?: {
        order_number: string;
        products?: {
            name: string;
        };
    };
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<CakeNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        fetchNotifications();

        const subscription = Notifications.addNotificationReceivedListener(() => {
            fetchNotifications();
        });

        return () => subscription.remove();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select(`
                  id,
                  order_id,
                  product_id,
                  title,
                  body,
                  status,
                  is_read,
                  image_url,
                  created_at,
                  orders (
                    order_number,
                    products ( name )
                  )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formatted: CakeNotification[] = (data || []).map((n: any) => {
                return {
                    id: n.id,
                    orderId: n.orders?.order_number || (n.order_id ? n.order_id.substring(0, 8) : null),
                    status: n.status,
                    title: n.title,
                    body: n.body,
                    isRead: n.is_read,
                    time: formatNotificationTime(n.created_at),
                    imageUrl: n.image_url,
                    productId: n.product_id ?? null,
                    orders: n.orders
                };
            });

            setNotifications(formatted);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Routes straight to the order screen using product_id — no cache, no text parsing.
    const handleNotificationTap = async (item: CakeNotification) => {
        // 1. Mark as read immediately in UI & Database
        toggleMarkAsRead(item.id);

        // 2. Route directly to order layout if a new product notification is tapped
        if (item.status === 'new_product' && item.productId) {
            try {
                const { data: matchedProduct, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', item.productId)
                    .maybeSingle();

                if (error) {
                    console.log('Product lookup error:', error);
                    return;
                }

                if (matchedProduct) {
                    router.push({
                        pathname: '../order',
                        params: {
                            id: matchedProduct.id,
                            name: matchedProduct.name,
                            price: (matchedProduct.price || 0).toString(),
                            seller_id: matchedProduct.seller_id || '',
                            description: matchedProduct.description || 'Delicious treat',
                            image_urls: JSON.stringify(matchedProduct.image_urls || null),
                            post_type: matchedProduct.post_type || 'sale',
                        }
                    });
                }
            } catch (err) {
                console.log('Routing failure from notification target lookup:', err);
            }
        }
    };

    const toggleMarkAsRead = async (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
    };

    const formatNotificationTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getStatusMeta = (status: string) => {
        switch (status) {
            case 'new_product': return { icon: 'cake-variant', color: '#db2777', bg: '#fce7f3' };
            case 'delivered': return { icon: 'check-circle-outline', color: '#10B981', bg: '#E6F4EA' };
            case 'pickup': return { icon: 'package-variant', color: '#06B6D4', bg: '#E0F7FA' };
            case 'ready': return { icon: 'progress-check', color: '#8B5CF6', bg: '#F5F3FF' };
            case 'in_progress': return { icon: 'stove', color: '#F59E0B', bg: '#FEF3C7' };
            case 'accepted': return { icon: 'thumb-up-outline', color: '#3B82F6', bg: '#E8F0FE' };
            case 'cancelled': return { icon: 'close-circle-outline', color: '#EF4444', bg: '#FEE2E2' };
            default: return { icon: 'clipboard-text-outline', color: '#6B46C1', bg: '#F3E8FF' };
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#6b46c1" />
                </View>
            ) : (
                <ScrollView
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotifications(); }} />
                    }
                >
                    {notifications.map((item) => {
                        const meta = getStatusMeta(item.status);
                        const itemName = item.orders?.products?.name || (item.status === 'new_product' ? 'Bakery Catalog' : 'Item');
                        
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.notifCard, !item.isRead && styles.unreadCardBorder]}
                                onPress={() => handleNotificationTap(item)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.cardHeaderRow}>
                                    <View style={styles.orderLabelGroup}>
                                        {item.orderId && (
                                            <>
                                                <Text style={[styles.orderIdText, item.isRead && styles.dimmedText]}>
                                                    #{item.orderId}
                                                </Text>
                                                <Text style={styles.dotSeparator}>•</Text>
                                            </>
                                        )}
                                        <Text style={[styles.cakeNameText, item.isRead && styles.dimmedText]} numberOfLines={1}>
                                            {itemName}
                                        </Text>
                                    </View>

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

                                <View style={[styles.cardBodyContent, item.isRead && styles.dimmedBodyOpacity]}>
                                    <View style={styles.contentAndImageRow}>
                                        <View style={styles.textDetailsContainer}>
                                            <Text style={styles.notifTitle}>{item.title}</Text>
                                            <Text style={styles.notifBody}>{item.body}</Text>
                                        </View>
                                        
                                        <View style={[styles.mediaPlaceholder, { backgroundColor: meta.bg }]}>
                                            {item.imageUrl ? (
                                                <Image source={{ uri: item.imageUrl }} style={styles.attachedImage} />
                                            ) : (
                                                <MaterialCommunityIcons name={meta.icon as any} size={26} color={meta.color} />
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.footerRow}>
                                        {!item.isRead && <Text style={styles.tapPrompt}>Tap to mark as read</Text>}
                                        <Text style={styles.notifTime}>{item.time}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {notifications.length === 0 && (
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <MaterialCommunityIcons name="bell-off-outline" size={48} color="#94a3b8" />
                            <Text style={{ color: '#64748b', marginTop: 8 }}>No activity updates yet.</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
    scrollContent: { paddingBottom: Platform.OS === 'ios' ? 44 : 32 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    headerTitleContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
    title: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
    unreadCountBadge: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, marginLeft: 4 },
    unreadCountText: { color: '#fff', fontSize: 11, fontWeight: '800' },
    markAllBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#f8fafc', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    markAllText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    list: { flex: 1, paddingHorizontal: 20 },
    notifCard: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 3 },
    unreadCardBorder: { borderColor: '#c084fc', backgroundColor: '#faf5ff', elevation: 5 },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f8fafc', paddingBottom: 8, marginBottom: 10 },
    orderLabelGroup: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
    orderIdText: { fontSize: 13, fontWeight: '700', color: '#6b46c1' },
    dotSeparator: { marginHorizontal: 6, color: '#94a3b8' },
    cakeNameText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
    dimmedText: { color: '#94a3b8' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
    statusBadgeText: { fontSize: 9, fontWeight: '800' },
    newIndicatorTag: { backgroundColor: '#ef4444', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
    newIndicatorText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
    cardBodyContent: { paddingHorizontal: 2 },
    dimmedBodyOpacity: { opacity: 0.6 },
    contentAndImageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
    textDetailsContainer: { flex: 1 },
    mediaPlaceholder: { width: 52, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    attachedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    notifTitle: { fontSize: 15, fontWeight: '700', color: '#1f2937' },
    notifBody: { fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 18 },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    tapPrompt: { fontSize: 11, color: '#a855f7', fontWeight: '600', fontStyle: 'italic' },
    notifTime: { fontSize: 11, color: '#94a3b8', fontWeight: '500', marginLeft: 'auto' },
});