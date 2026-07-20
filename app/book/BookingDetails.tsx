import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PRIMARY = '#6b46c1';

interface BookingDetailsProps {
  productName: string;
  guests: string;
  duration: string;
  productPrice: number;
}

export default function BookingDetails({
  productName,
  guests,
  duration,
  productPrice,
}: BookingDetailsProps) {
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryTitle}>Booking Summary</Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Cake</Text>
        <Text style={styles.summaryValue}>{productName}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Guests</Text>
        <Text style={styles.summaryValue}>{guests || '--'}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Needed</Text>
        <Text style={styles.summaryValue}>{duration}</Text>
      </View>

      <View style={styles.summaryDivider} />

      <Text style={styles.priceTitle}>Starting Price</Text>
      <Text style={styles.bigPrice}>
        KSh {productPrice.toLocaleString()}+
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginTop: 28,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 18,
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#64748b',
    fontSize: 15,
  },
  summaryValue: {
    fontWeight: '700',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#ececec',
    marginVertical: 16,
  },
  priceTitle: {
    color: '#64748b',
    fontSize: 14,
  },
  bigPrice: {
    marginTop: 6,
    color: PRIMARY,
    fontWeight: '800',
    fontSize: 30,
  },
});

