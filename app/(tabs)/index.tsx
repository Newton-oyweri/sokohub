import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CakeCarousel from './Cakes/CakeCarousel';
import Account from './Account/Account'; 
import Header, { HEADER_HEIGHT } from '../../components/Header'; 
import NotificationsModal from '../../components/NotificationsModal'; 

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 48 : StatusBar.currentHeight || 0;

export default function App() {
  const [activeTab, setActiveTab] = useState<'cakes' | 'account'>('cakes');
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>

      {/* Background Header */}
      <View style={[styles.headerBackground, { paddingTop: STATUS_BAR_HEIGHT }]}>
        <Header />
      </View>

      {/* Main Scrollable Content */}
      <ScrollView 
        style={StyleSheet.absoluteFillObject}
        contentContainerStyle={[styles.scrollContent, { paddingTop: STATUS_BAR_HEIGHT }]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} 
      >
        <View style={{ height: HEADER_HEIGHT - 60 }} />

        {/* Sticky Tabs */}
        <View style={styles.stickyTabsWrapper}>
          <View style={styles.tabsContainer}>
            
            <TouchableOpacity 
              style={styles.tabButton}
              onPress={() => setActiveTab('cakes')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="storefront-outline"
                size={22}
                color={activeTab === 'cakes' ? '#E84E7A' : '#9CA3AF'}
              />
              <Text style={[styles.tabText, activeTab === 'cakes' && styles.activeTabText]}>
                Shop
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.tabButton}
              onPress={() => setActiveTab('account')}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={activeTab === 'account' ? "person-circle" : "person-circle-outline"} 
                size={28} 
                color={activeTab === 'account' ? "#6b46c1" : "#9CA3AF"} 
              />
              <Text style={[styles.tabText, activeTab === 'account' && styles.activeTabText]}>
                Account
              </Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentCard}>
          <View style={styles.contentBody}>
            {activeTab === 'cakes' ? <CakeCarousel /> : <Account />}
          </View>
        </View>
      </ScrollView>

      {/* Notification Bell */}
      <TouchableOpacity 
        style={[styles.fixedNotifIconContainer, { top: STATUS_BAR_HEIGHT + 12 }]} 
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="notifications-outline" size={24} color="#1F2937" />
        <View style={styles.badgeIndicator} />
      </TouchableOpacity>

      {/* The Custom Left Sliding Drawer Component */}
      <NotificationsModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4FF',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stickyTabsWrapper: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 10,
    minWidth: 90,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 6,
  },
  activeTabText: {
    color: '#6b46c1',
    fontWeight: '700',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentBody: {
    flex: 1,
  },
  fixedNotifIconContainer: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#FFFFFF',
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  badgeIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#EF4444',
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});