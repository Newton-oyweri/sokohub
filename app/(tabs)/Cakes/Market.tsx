import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const marketCakes = [
  { id: 'm1', name: 'Red Velvet Magic', price: 600, rating: 4.8, salesCount: 142, description: 'Rich red velvet with cream cheese frosting', image: require('../../../assets/images/town.png') },
  { id: 'm2', name: 'Blueberry Cheesecake', price: 650, rating: 4.9, salesCount: 98, description: 'Creamy cheesecake with fresh blueberries', image: require('../../../assets/images/town.png') },
  { id: 'm3', name: 'Classic Chocolate', price: 450, rating: 4.7, salesCount: 215, description: 'Moist chocolate cake with ganache', image: require('../../../assets/images/cake.png') },
  { id: 'm4', name: 'Strawberry Shortcake', price: 550, rating: 4.8, salesCount: 167, description: 'Fresh strawberries and whipped cream', image: require('../../../assets/images/moist.png') },
  { id: 'm5', name: 'Strawberry Shortcake', price: 850, rating: 4.8, salesCount: 167, description: 'Fresh strawberries and whipped cream', image: require('../../../assets/images/milk.png') },
  { id: 'm6', name: 'Strawberry Shortcake', price: 550, rating: 4.8, salesCount: 167, description: 'Fresh strawberries and whipped cream', image: require('../../../assets/images/moist.png') },
  { id: 'm7', name: 'Strawberry Shortcake', price: 2550, rating: 4.8, salesCount: 167, description: 'Fresh strawberries and whipped cream', image: require('../../../assets/images/hill.png') },
  { id: 'm8', name: 'Strawberry Shortcake', price: 550, rating: 4.8, salesCount: 167, description: 'Fresh strawberries and whipped cream', image: require('../../../assets/images/moist.png') },
  { id: 'm9', name: 'Strawberry Shortcake', price: 550, rating: 4.8, salesCount: 167, description: 'Fresh strawberries and whipped cream', image: require('../../../assets/images/moist.png') },
  { id: 'm10', name: 'Strawberry Shortcake', price: 550, rating: 4.8, salesCount: 167, description: 'Fresh strawberries and whipped cream', image: require('../../../assets/images/moist.png') },
];

type FilterOption = 'all' | 'low-to-high' | 'high-to-low' | 'under-500' | '500-700' | 'above-700';

export default function MarketSection() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

  const filteredAndSortedCakes = useMemo(() => {
    let result = [...marketCakes];

    switch (activeFilter) {
      case 'low-to-high':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'high-to-low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'under-500':
        result = result.filter(item => item.price < 500);
        break;
      case '500-700':
        result = result.filter(item => item.price >= 500 && item.price <= 700);
        break;
      case 'above-700':
        result = result.filter(item => item.price > 700);
        break;
      default:
        break;
    }

    return result;
  }, [activeFilter]);

  // Helper function to chunk the plain array into pairs for a clean 2-column grid row setup
  const cakeRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < filteredAndSortedCakes.length; i += 2) {
      rows.push(filteredAndSortedCakes.slice(i, i + 2));
    }
    return rows;
  }, [filteredAndSortedCakes]);

  const renderMarketItem = (item: typeof marketCakes[0]) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.itemCard}
      onPress={() => router.push(`../review`)}
      activeOpacity={0.9}
    >
      <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>KSh {item.price}</Text>
        <Text style={styles.itemMeta}>
          ★ {item.rating} • {item.salesCount} sold
        </Text>

        <TouchableOpacity 
          style={styles.smallOrderBtn}
          onPress={() => router.push('../order')}
        >
          <Text style={styles.smallOrderBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.marketContainer, { paddingBottom: insets.bottom + 20 }]}>
      {/* Header Layout View */}
      <View style={styles.header}>
        <Text style={styles.marketTitle}>Explore Market</Text>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="filter-outline" size={24} color="#6b46c1" />
        </TouchableOpacity>
      </View>

      {/* Grid Content Section mapped dynamically */}
      <View style={styles.gridContainer}>
        {cakeRows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No cakes found</Text>
            <Text style={styles.emptySubtitle}>
              Sorry, we don't have any special wonder{'\n'}in that price range right now.
            </Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setActiveFilter('all');
                setModalVisible(false);
              }}
            >
              <Text style={styles.resetButtonText}>Show All Cakes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          cakeRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.columnWrapper}>
              {row.map((item) => renderMarketItem(item))}
              {/* Invisible spacer block ensures a lone item at the end stays sized properly on the left edge */}
              {row.length === 1 && <View style={styles.spacerCard} />}
            </View>
          ))
        )}
      </View>

      {/* Filter Options Overlay Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <Text style={styles.modalTitle}>Filter by Price</Text>
            
            <TouchableOpacity style={styles.filterOption} onPress={() => { setActiveFilter('all'); setModalVisible(false); }}>
              <Text style={styles.filterText}>All Prices</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterOption} onPress={() => { setActiveFilter('low-to-high'); setModalVisible(false); }}>
              <Text style={styles.filterText}>Price: Low to High</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterOption} onPress={() => { setActiveFilter('high-to-low'); setModalVisible(false); }}>
              <Text style={styles.filterText}>Price: High to Low</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterOption} onPress={() => { setActiveFilter('under-500'); setModalVisible(false); }}>
              <Text style={styles.filterText}>Under KSh 500</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterOption} onPress={() => { setActiveFilter('500-700'); setModalVisible(false); }}>
              <Text style={styles.filterText}>KSh 500 - 700</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterOption} onPress={() => { setActiveFilter('above-700'); setModalVisible(false); }}>
              <Text style={styles.filterText}>Above KSh 700</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  marketContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  marketTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  filterButton: {
    padding: 8,
  },
  gridContainer: {
    paddingBottom: 30,
  },
  columnWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  spacerCard: {
    width: '48%',
    backgroundColor: 'transparent',
  },
  itemImage: {
    width: '100%',
    height: 140,
  },
  itemInfo: {
    padding: 12,
    position: 'relative',
    paddingBottom: 48,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6b46c1',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: '#64748b',
  },
  smallOrderBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#6b46c1',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },
  smallOrderBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  resetButton: {
    marginTop: 24,
    backgroundColor: '#6b46c1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  filterText: {
    fontSize: 16,
    color: '#1e293b',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#6b46c1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});