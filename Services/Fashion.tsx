import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

type FashionItem = {
  id: string;
  name: string;
  price: number;
};

// Mock data — replace with real inventory once Fashion is sourced.
const MOCK_ITEMS: FashionItem[] = [
  { id: 'tshirt', name: "Men's T-Shirt", price: 800 },
  { id: 'dress', name: "Women's Dress", price: 2000 },
  { id: 'sneakers', name: 'Sneakers', price: 3500 },
  { id: 'jeans', name: 'Denim Jeans', price: 1800 },
  { id: 'jacket', name: 'Jacket', price: 2800 },
  { id: 'handbag', name: 'Handbag', price: 1500 },
];

function formatKES(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

export default function Fashion() {
  const renderItem = ({ item }: { item: FashionItem }) => (
    <TouchableOpacity style={styles.row} activeOpacity={0.7}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{formatKES(item.price)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Fashion</Text>
      <Text style={styles.subheading}>Coming soon — sample listings shown below</Text>

      <FlatList
        data={MOCK_ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  subheading: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 16,
  },
  listContent: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
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
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b46c1',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 16,
  },
});
