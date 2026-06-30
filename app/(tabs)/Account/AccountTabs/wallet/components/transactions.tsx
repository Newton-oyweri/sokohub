import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types/wallet.types';

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh: () => void;
  formatDate: (dateString: string) => string;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onRefresh, 
  formatDate 
}) => {
  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'SUCCESS': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'FAILED': return '#ef4444';
      default: return '#64748b';
    }
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh-outline" size={20} color="#6b46c1" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={48} color="#c4b5fd" />
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptySubtext}>Your recent activities will appear here</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh-outline" size={20} color="#6b46c1" />
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsContainer}>
        {transactions.map((item) => {
          const isDeposit = item.type === 'DEPOSIT';
          return (
            <View key={item.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: isDeposit ? '#ecfdf5' : '#fdf4ff' }
                ]}>
                  <Ionicons
                    name={isDeposit ? 'wallet-outline' : 'cart-outline'}
                    size={20}
                    color={isDeposit ? '#10b981' : '#c026d3'}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDescription} numberOfLines={1}>
                    {item.description || (isDeposit ? 'Funds Deposited' : 'Purchase')}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(item.created_at)}
                  </Text>
                  <Text style={[styles.transactionStatus, { color: getStatusColor(item.status) }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: isDeposit ? '#10b981' : '#e11dd4' }
              ]}>
                {isDeposit ? '+' : '-'} {Math.abs(item.amount).toLocaleString()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  transactionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 8,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  transactionStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});