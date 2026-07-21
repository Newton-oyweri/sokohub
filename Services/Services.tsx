import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';

// Import central Supabase client via path alias
import { supabase } from '@/lib/supabase';

export type ServiceItem = {
  id: string;
  name: string;
  price: number;
  description?: string;
};

function formatKES(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

type Props = {
  onSelectService?: (service: ServiceItem) => void;
  onSubmitCustomTask?: (taskDescription: string) => void;
  sellerId?: string;
};

export default function Services({ onSelectService, onSubmitCustomTask, sellerId }: Props) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customTask, setCustomTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, description')
        .eq('post_type', 'booking')
        .eq('is_available', true)
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) setServices(data as ServiceItem[]);
    } catch (err: any) {
      console.error('Error fetching services:', err.message);
      Alert.alert('Error', 'Unable to load services. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomTaskSubmit = async () => {
    if (!customTask.trim()) return;

    const taskText = customTask.trim();

    if (onSubmitCustomTask) {
      onSubmitCustomTask(taskText);
      setCustomTask('');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('products').insert([
        {
          seller_id: sellerId || 'fc880aa8-accf-43ad-bb05-9d025d9d74c7',
          name: taskText,
          description: 'Custom requested task',
          price: 150.0,
          category: 'events',
          rating: 5.0,
          is_available: true,
          post_type: 'booking',
        },
      ]);

      if (error) throw error;

      Alert.alert('Request Sent', 'Your custom task request has been received!');
      setCustomTask('');
      fetchServices();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send request.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: ServiceItem }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => onSelectService?.(item)}
    >
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.priceWrap}>
        <Text style={styles.priceLabel}>Starting from</Text>
        <Text style={styles.priceValue}>{formatKES(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <Text style={styles.heading}>Services</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>ℹ️ Pricing Notice</Text>
        <Text style={styles.infoText}>
          All prices shown are <Text style={styles.bold}>one-time starting rates</Text> for a single request — <Text style={styles.bold}>not</Text> monthly or recurring subscriptions. Final costs depend on distance, effort, and task complexity.
        </Text>
      </View>

      <Text style={styles.subheading}>Select a service to continue or suggest a custom task below.</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.customTaskContainer}>
      <Text style={styles.customTaskTitle}>Don't see what you need?</Text>
      <Text style={styles.customTaskSubtitle}>Describe your custom task and request a quote:</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="e.g. Assemble IKEA furniture, Fix door hinge..."
          placeholderTextColor="#9CA3AF"
          value={customTask}
          onChangeText={setCustomTask}
        />
        <TouchableOpacity
          style={[styles.submitButton, (!customTask.trim() || submitting) && styles.disabledButton]}
          disabled={!customTask.trim() || submitting}
          onPress={handleCustomTaskSubmit}
        >
          {submitting ? (
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
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No active services found in database.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    paddingBottom:56,
  },
  loaderContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  infoCard: {
    marginTop: 12,
    marginBottom: 14,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8F5FF',
    borderWidth: 1,
    borderColor: '#E9D8FD',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B46C1',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#1F2937',
  },
  subheading: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 12,
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b46c1',
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  emptyWrap: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  customTaskContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customTaskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  customTaskSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#FAFAFA',
  },
  submitButton: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#6B46C1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#C4B5FD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

