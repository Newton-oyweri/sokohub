import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import UserProfile from './AccountTabs/UserProfile';   

import Wallet from './AccountTabs/Wallet';   
import MyOrders from './AccountTabs/MyOrders';   


export default function AccountContent() {
  const [currentView, setCurrentView] = useState<'menu' | 'profile' | 'wallet' | 'orders'>('menu');

  const handleWalletPress = () => setCurrentView('wallet');
  const handleOrdersPress = () => setCurrentView('orders');

  const handleProfilePress = () => {
    setCurrentView('profile');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
  };

  if (currentView === 'profile') return <UserProfile onBack={handleBackToMenu} />;
  if (currentView === 'wallet') return <Wallet onBack={handleBackToMenu} />;
  if (currentView === 'orders') return <MyOrders onBack={handleBackToMenu} />;

  // Main Menu
  return (
    <View style={styles.menuContainer}>
      {/* User Profile - Now navigates internally */}
      <TouchableOpacity 
        style={styles.menuItem} 
        activeOpacity={0.7}
        onPress={handleProfilePress}
      >
        <View style={styles.menuLeftContent}>
          <View style={[styles.iconContainer, { backgroundColor: '#c4b5fd' }]}>
            <Ionicons name="person-outline" size={26} color="#6b46c1" />
          </View>
          <View>
            <Text style={styles.menuTitle}>User Profile</Text>
            <Text style={styles.menuSubtitle}>K.U. Student</Text>
            <Text style={styles.menuSubtitle}>email: k.uymt@gmail.com</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

    
      <TouchableOpacity 
        style={styles.menuItem} 
        activeOpacity={0.7}
        onPress={handleWalletPress}
      >
        <View style={styles.menuLeftContent}>
          <View style={[styles.iconContainer, { backgroundColor: '#a5f3fc' }]}>
            <Ionicons name="wallet-outline" size={26} color="#155e75" />
          </View>
          <View>
            <Text style={styles.menuTitle}>My Wallet</Text>
            <Text style={styles.menuSubtitle}>KSh 2,450 • Tap to manage</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* FIXED: Wrapped the comment below properly inside curly braces so it doesn't render as raw text */}
      {/* Add this menu item (replace or add near My Orders) */}
      <TouchableOpacity 
        style={styles.menuItem} 
        activeOpacity={0.7}
        onPress={handleOrdersPress}
      >
        <View style={styles.menuLeftContent}>
          <View style={[styles.iconContainer, { backgroundColor: '#67e8f9' }]}>
            <Ionicons name="cart-outline" size={26} color="#155e75" />
          </View>
          <View>
            <Text style={styles.menuTitle}>My Orders</Text>
            <Text style={styles.menuSubtitle}>Recent order history, 10 orders...</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
        
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    padding: 16,
    paddingTop: 20,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  menuLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 1,
  },
});