import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';

type ServiceItem = {
  id: string;
  name: string;
  startingFrom: number;
};

// Pricing follows a simple tiered rule of thumb:
// 150 — quick pickups/deliveries/shopping
// 250-300 — tasks taking roughly 30-60 minutes
// 500-800 — longer or more physically demanding services
const SERVICES: ServiceItem[] = [
  { id: 'laundry', name: 'Laundry', startingFrom: 250 },
  { id: 'grocery-shopping', name: 'Grocery shopping', startingFrom: 150 },
  { id: 'queue-standing', name: 'Queue standing', startingFrom: 300 },
  { id: 'medicine-pickup', name: 'Medicine pickup', startingFrom: 150 },
  { id: 'food-pickup', name: 'Food pickup', startingFrom: 150 },
  { id: 'parcel-pickup', name: 'Parcel pickup', startingFrom: 150 },
  { id: 'parcel-dropoff', name: 'Parcel drop-off', startingFrom: 150 },
  { id: 'document-delivery', name: 'Document delivery', startingFrom: 150 },
  { id: 'key-pickup-dropoff', name: 'Key pickup/drop-off', startingFrom: 150 },
  { id: 'house-cleaning', name: 'House cleaning', startingFrom: 800 },
  { id: 'room-cleaning', name: 'Room cleaning', startingFrom: 500 },
  { id: 'ironing-clothes', name: 'Ironing clothes', startingFrom: 250 },
  { id: 'water-delivery', name: 'Water fetching / delivery', startingFrom: 200 },
  { id: 'trash-disposal', name: 'Trash disposal', startingFrom: 150 },
  { id: 'compound-cleaning', name: 'Compound cleaning', startingFrom: 300 },
  { id: 'garden-watering', name: 'Garden watering', startingFrom: 200 },
  { id: 'personal-shopping', name: 'Personal shopping', startingFrom: 200 },
  { id: 'gift-delivery', name: 'Gift delivery', startingFrom: 200 },
  { id: 'book-pickup', name: 'Book or package pickup', startingFrom: 150 },
  { id: 'moving-assistance', name: 'Moving assistance (small items)', startingFrom: 500 },
  { id: 'car-wash', name: 'Car wash', startingFrom: 400 },
  { id: 'meal-preparation', name: 'Meal preparation', startingFrom: 500 },
  { id: 'cooking-assistance', name: 'Cooking assistance', startingFrom: 400 },
  { id: 'babysitting', name: 'Babysitting', startingFrom: 600 },
  { id: 'elderly-assistance', name: 'Elderly assistance', startingFrom: 600 },
  { id: 'shop-errand', name: 'Shop errand', startingFrom: 150 },
  { id: 'school-pickup', name: 'School item pickup', startingFrom: 150 },
  { id: 'bank-errand', name: 'Bank errand', startingFrom: 200 },
  { id: 'event-assistance', name: 'Event errand assistance', startingFrom: 400 },
  { id: 'other-task', name: 'Other task', startingFrom: 150 },
];
function formatKES(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

type Props = {
  onSelectService?: (service: ServiceItem) => void;
  onSubmitCustomTask?: (taskDescription: string) => void;
};

export default function Services({ onSelectService, onSubmitCustomTask }: Props) {
  const [customTask, setCustomTask] = useState('');

  const handleCustomTaskSubmit = () => {
    if (!customTask.trim()) return;
    onSubmitCustomTask?.(customTask.trim());
    setCustomTask('');
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
        <Text style={styles.priceValue}>{formatKES(item.startingFrom)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <Text style={styles.heading}>Services</Text>

      {/* Info Card Clarifying One-Time Pricing */}
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
          style={[styles.submitButton, !customTask.trim() && styles.disabledButton]}
          disabled={!customTask.trim()}
          onPress={handleCustomTaskSubmit}
        >
          <Text style={styles.submitButtonText}>Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={SERVICES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  /* Custom Task Input Styles */
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

