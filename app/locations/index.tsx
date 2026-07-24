import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Import your configured Supabase client here
import { supabase } from '../../lib/supabase'; 

interface County {
  id: string;
  name: string;
  code: number;
}

interface PickupLocation {
  id: string;
  county_id: string;
  name: string;
}

interface InfoModalState {
  title: string;
  message: string;
  isError?: boolean;
}

function InfoModal({
  info,
  onClose,
}: {
  info: InfoModalState | null;
  onClose: () => void;
}) {
  const router = useRouter();

  const handleButtonPress = () => {
    // Check if this is an authentication error
    if (info?.title === 'Authentication Required') {
      // Navigate to auth page
      router.push('/auth');
    } else {
      // Otherwise, just close the modal
      onClose();
    }
  };

  return (
    <Modal
      visible={!!info}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View
            style={[
              styles.modalIconWrap,
              info?.isError && { backgroundColor: '#fef2f2' },
            ]}
          >
            <Ionicons
              name={info?.isError ? 'alert-circle' : 'checkmark-circle'}
              size={28}
              color={info?.isError ? '#ef4444' : '#6b46c1'}
            />
          </View>
          <Text style={styles.modalTitle}>{info?.title}</Text>
          <Text style={styles.modalMessage}>{info?.message}</Text>

          <TouchableOpacity
            style={[
              styles.modalButton,
              info?.isError && { backgroundColor: '#ef4444' },
            ]}
            onPress={handleButtonPress}
            activeOpacity={0.8}
          >
            <Text style={styles.modalButtonText}>
              {info?.title === 'Authentication Required' ? 'Sign In' : 'Got it'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function LocationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Tab & Selection state
  const [locationType, setLocationType] = useState<'pickup' | 'delivery'>('pickup');
  
  // Data lists
  const [counties, setCounties] = useState<County[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  
  // Selections & Inputs
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null);
  const [selectedPickup, setSelectedPickup] = useState<PickupLocation | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  // Loaders & Feedback
  const [fetchingData, setFetchingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [infoModal, setInfoModal] = useState<InfoModalState | null>(null);

  useEffect(() => {
    fetchCountiesAndPickupLocations();
  }, []);

  const fetchCountiesAndPickupLocations = async () => {
    try {
      setFetchingData(true);

      // 1. Fetch Counties
      const { data: countiesData, error: countiesErr } = await supabase
        .from('counties')
        .select('*')
        .order('name', { ascending: true });

      if (countiesErr) throw countiesErr;

      setCounties(countiesData || []);

      // Default to Bungoma if available
      const bungoma = countiesData?.find((c) => c.name.toLowerCase() === 'bungoma');
      const activeCounty = bungoma || (countiesData && countiesData[0]) || null;
      setSelectedCounty(activeCounty);

      // 2. Fetch Pickup Locations for selected county
      if (activeCounty) {
        await fetchPickupLocationsForCounty(activeCounty.id);
      }
    } catch (err: any) {
      setInfoModal({
        title: 'Error Loading Locations',
        message: err.message || 'Failed to fetch regional locations.',
        isError: true,
      });
    } finally {
      setFetchingData(false);
    }
  };

  const fetchPickupLocationsForCounty = async (countyId: string) => {
    const { data, error } = await supabase
      .from('pickup_locations')
      .select('*')
      .eq('county_id', countyId)
      .order('name', { ascending: true });

    if (!error && data) {
      setPickupLocations(data);
    }
  };

  const handleCountySelect = async (county: County) => {
    setSelectedCounty(county);
    setSelectedPickup(null); // Reset pickup when changing county
    await fetchPickupLocationsForCounty(county.id);
  };

  const handleSaveLocation = async () => {
    // 1. Validation
    if (locationType === 'pickup' && !selectedPickup) {
      setInfoModal({
        title: 'Selection Required',
        message: 'Please choose a pickup station to continue.',
        isError: true,
      });
      return;
    }

    if (locationType === 'delivery' && !deliveryAddress.trim()) {
      setInfoModal({
        title: 'Address Required',
        message: 'Please enter a detailed delivery address.',
        isError: true,
      });
      return;
    }

    try {
      setIsSaving(true);

      // Get authenticated user
      const { data: { user }, error: userErr } = await supabase.auth.getUser();

      if (userErr || !user) {
        setInfoModal({
          title: 'Authentication Required',
          message: 'Please sign in to save your location preferences.',
          isError: true,
        });
        return;
      }

      // If set as default, optionally clear existing defaults for this user
      if (isDefault) {
        await supabase
          .from('user_locations')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      // Prepare payload adhering to CHECK constraints
      const payload = {
        user_id: user.id,
        location_type: locationType,
        pickup_location_id: locationType === 'pickup' ? selectedPickup?.id : null,
        delivery_address: locationType === 'delivery' ? deliveryAddress.trim() : null,
        is_default: isDefault,
      };

      const { error: insertErr } = await supabase
        .from('user_locations')
        .insert(payload);

      if (insertErr) throw insertErr;

      setInfoModal({
        title: 'Location Saved',
        message: 'Your preferred location has been updated successfully.',
      });

      // Optionally navigate back after a delay
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        }
      }, 1500);

    } catch (err: any) {
      setInfoModal({
        title: 'Save Failed',
        message: err.message || 'An error occurred while saving your location.',
        isError: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContainer, { paddingBottom: 140 }]}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Location</Text>
          <Text style={styles.headerSubtitle}>
            Choose how and where you'd like your order delivered
          </Text>
        </View>

        {/* Location Type Switcher */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeTab,
              locationType === 'pickup' && styles.typeTabActive,
            ]}
            onPress={() => setLocationType('pickup')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="location"
              size={18}
              color={locationType === 'pickup' ? '#6b46c1' : '#64748b'}
            />
            <Text
              style={[
                styles.typeTabText,
                locationType === 'pickup' && styles.typeTabTextActive,
              ]}
            >
              Self-Pickup Point
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeTab,
              locationType === 'delivery' && styles.typeTabActive,
            ]}
            onPress={() => setLocationType('delivery')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="home"
              size={18}
              color={locationType === 'delivery' ? '#6b46c1' : '#64748b'}
            />
            <Text
              style={[
                styles.typeTabText,
                locationType === 'delivery' && styles.typeTabTextActive,
              ]}
            >
              Door Delivery
            </Text>
          </TouchableOpacity>
        </View>

        {/* MODE A: PICKUP LOCATION SELECTOR */}
        {locationType === 'pickup' && (
          <View>
            {/* County Horizontal Selector */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>County</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.countyScroll}
              >
                {counties.map((county) => {
                  const isSelected = selectedCounty?.id === county.id;
                  return (
                    <TouchableOpacity
                      key={county.id}
                      style={[
                        styles.countyChip,
                        isSelected && styles.countyChipActive,
                      ]}
                      onPress={() => handleCountySelect(county)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.countyChipText,
                          isSelected && styles.countyChipTextActive,
                        ]}
                      >
                        {county.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Pickup Stations List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Pickup Stations</Text>
              <Text style={styles.sectionSubtitle}>
                Select a station in {selectedCounty?.name || 'your county'}
              </Text>

              {fetchingData ? (
                <View style={styles.loaderWrap}>
                  <ActivityIndicator size="small" color="#6b46c1" />
                </View>
              ) : pickupLocations.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>
                    No pickup locations found for this county.
                  </Text>
                </View>
              ) : (
                pickupLocations.map((item) => {
                  const isSelected = selectedPickup?.id === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.quickPointRow,
                        isSelected && styles.quickPointRowActive,
                      ]}
                      onPress={() => setSelectedPickup(item)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxChecked,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                      <View style={styles.quickPointTextWrap}>
                        <Text style={styles.quickPointLabel}>{item.name}</Text>
                        <Text style={styles.quickPointSubtitle}>
                          Station Pickup
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        )}

        {/* MODE B: DOOR DELIVERY ADDRESS INPUT */}
        {locationType === 'delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.sectionSubtitle}>
              Provide landmark and house details for accurate drop-off
            </Text>

            <View style={styles.addressInputContainer}>
              <TextInput
                style={styles.addressInput}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Enter your detailed physical address..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.addressSample}>
                <Ionicons name="bulb-outline" size={16} color="#6b46c1" />
                <Text style={styles.addressSampleText}>
                  Example: House 24, Greenview Apartments, Off Kanduyi-Webuye Road, Near Kibabii Gate, Bungoma. Call: 0712 345 678.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Default Toggle Checkbox */}
        <TouchableOpacity
          style={styles.defaultRow}
          onPress={() => setIsDefault(!isDefault)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
            {isDefault && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={styles.defaultLabel}>Set as my primary default location</Text>
        </TouchableOpacity>

        {/* Summary Card */}
        <View style={styles.deliveryBox}>
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryIconRow}>
              <Ionicons
                name={locationType === 'pickup' ? 'location' : 'home'}
                size={18}
                color="#64748b"
              />
              <Text style={styles.deliveryLabel}>Selected</Text>
            </View>
            <Text style={styles.deliveryValue} numberOfLines={2}>
              {locationType === 'pickup'
                ? selectedPickup?.name || 'None selected'
                : deliveryAddress.trim() || 'None provided'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
          activeOpacity={0.8}
          onPress={handleSaveLocation}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Location</Text>
          )}
        </TouchableOpacity>
      </View>

      <InfoModal info={infoModal} onClose={() => setInfoModal(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f4ff' },
  scrollContainer: { padding: 20 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4 },
  
  // Tabs
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  typeTabActive: {
    backgroundColor: '#faf9fe',
    borderWidth: 1,
    borderColor: '#6b46c1',
  },
  typeTabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  typeTabTextActive: { color: '#6b46c1', fontWeight: '700' },

  // Sections
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 12 },

  // County Chips
  countyScroll: { gap: 8, paddingVertical: 4 },
  countyChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  countyChipActive: {
    backgroundColor: '#6b46c1',
    borderColor: '#6b46c1',
  },
  countyChipText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  countyChipTextActive: { color: '#fff' },

  // Pickups
  quickPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  quickPointRowActive: { borderColor: '#6b46c1', backgroundColor: '#faf9fe' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: { backgroundColor: '#6b46c1', borderColor: '#6b46c1' },
  quickPointTextWrap: { flex: 1 },
  quickPointLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  quickPointSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  // Address Inputs
  addressInputContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  addressInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addressSample: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
    backgroundColor: '#faf9fe',
  },
  addressSampleText: {
    fontSize: 12,
    color: '#7c3aed',
    flex: 1,
    lineHeight: 17,
    fontWeight: '500',
  },

  // Default option row
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  defaultLabel: { fontSize: 14, fontWeight: '600', color: '#0f172a' },

  // Summary
  deliveryBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deliveryRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
  },
  deliveryIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '30%' },
  deliveryLabel: { color: '#64748b', fontSize: 14 },
  deliveryValue: {
    fontWeight: '600',
    color: '#0f172a',
    fontSize: 14,
    width: '70%',
    textAlign: 'right',
  },

  // Loaders / Empty
  loaderWrap: { paddingVertical: 20, alignItems: 'center' },
  emptyWrap: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: { color: '#94a3b8', fontSize: 13 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  saveButton: {
    backgroundColor: '#6b46c1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f4effc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 },
  modalMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#6b46c1',
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

