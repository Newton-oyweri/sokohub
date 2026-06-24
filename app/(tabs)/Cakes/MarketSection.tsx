// MarketSection.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CategoryTabs from './CategoryTabs';
import ProductGrid from './ProductGrid';

const marketItems = [
  // Cakes...
  { id: 'c1', name: 'skyla favourite', category: 'cakes', price: 600, rating: 4.8, salesCount: 142, image: require('../../../assets/images/town.png') },
  { id: 'c2', name: 'Blueberry Cheesecake', category: 'cakes', price: 650, rating: 4.9, salesCount: 98, image: require('../../../assets/images/town.png') },
  { id: 'c3', name: 'Classic Chocolate', category: 'cakes', price: 450, rating: 4.7, salesCount: 215, image: require('../../../assets/images/cake.png') },
  { id: 'c4', name: 'Strawberry Bliss', category: 'cakes', price: 550, rating: 4.8, salesCount: 167, image: require('../../../assets/images/moist.png') },

  // Pizzas...
  { id: 'p1', name: 'Cheesy Veggie Pizza', category: 'pizza', price: 1200, rating: 4.6, salesCount: 95, image: require('../../../assets/images/town.png') },
  { id: 'p2', name: 'Meat Lovers Pizza', category: 'pizza', price: 1300, rating: 4.5, salesCount: 76, image: require('../../../assets/images/town.png') },
  { id: 'p3', name: 'Margherita Classic', category: 'pizza', price: 900, rating: 4.7, salesCount: 120, image: require('../../../assets/images/cake.png') },

  // Flowers...
  { id: 'f1', name: 'Red Roses Bouquet', category: 'flowers', price: 1000, rating: 4.9, salesCount: 68, image: require('../../../assets/images/rose.webp') },
  { id: 'f2', name: 'Single Red Rose', category: 'flowers', price: 300, rating: 4.8, salesCount: 50, image: require('../../../assets/images/moist.png') },
  { id: 'f3', name: 'Mixed Flower Bouquet', category: 'flowers', price: 850, rating: 4.7, salesCount: 42, image: require('../../../assets/images/milk.png') },
];

export default function MarketSection() {
  const insets = useSafeAreaInsets();
  const [filteredItems, setFilteredItems] = useState(marketItems);

  return (
    <View style={[styles.marketContainer, { paddingBottom: insets.bottom + 20 }]}>
      <CategoryTabs 
        marketItems={marketItems} 
        onFiltersChange={setFilteredItems} 
      />
      <ProductGrid items={filteredItems} />
    </View>
  );
}

const styles = StyleSheet.create({
  marketContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
});