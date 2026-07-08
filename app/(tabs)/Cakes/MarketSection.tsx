// MarketSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';

import CategoryTabs from './CategoryTabs';
import ProductGrid from './ProductGrid';

// Type definition for product from Supabase
interface Product {
  id: string;
  name: string;
  category: 'cake' | 'pizza' | 'flowers';
  price: number;
  description: string;
  image_urls: string[];
  is_available: boolean;
  post_type: 'sale' | 'booking' | 'pinned';
  seller_id: string;
  created_at: string;
  updated_at: string;
}



export default function MarketSection() {
  const insets = useSafeAreaInsets();
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from Supabase
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)       
      .eq('post_type', 'sale')       
      .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setAllProducts(data);
        setFilteredItems(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle filter changes from CategoryTabs
  const handleFilterChange = (filtered: Product[]) => {
    setFilteredItems(filtered);
  };

  return (
    <View style={[styles.marketContainer, { paddingBottom: insets.bottom + 20 }]}>
      <CategoryTabs 
        marketItems={allProducts} 
        onFiltersChange={handleFilterChange} 
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  retryText: {
    marginTop: 8,
    fontSize: 16,
    color: '#8B5CF6',
    fontFamily: 'Inter_600SemiBold',
    textDecorationLine: 'underline',
  },
});