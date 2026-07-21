import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../lib/supabase'; // Adjust path if needed

export interface ActiveLocation {
  id: string;
  location_type: 'pickup' | 'delivery';
  displayAddress: string;
}

interface LocationSelectorProps {
  onLocationFetched?: (location: ActiveLocation | null) => void;
}

export default function LocationSelector({ onLocationFetched }: LocationSelectorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState<ActiveLocation | null>(null);

  useEffect(() => {
    fetchUserLocation();
  }, []);

  const fetchUserLocation = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Query default location or most recently created user location
      const { data, error } = await supabase
        .from('user_locations')
        .select(`
          id,
          location_type,
          delivery_address,
          pickup_locations (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user location:', error);
      }

      if (data) {
        let addressStr = '';
        if (data.location_type === 'pickup') {
          // pickup_locations is returned as an object or array based on schema relation
          const pickupData = Array.isArray(data.pickup_locations)
            ? data.pickup_locations[0]
            : data.pickup_locations;
          addressStr = pickupData?.name || 'Selected Pickup Station';
        } else {
          addressStr = data.delivery_address || 'Custom Delivery Address';
        }

        const locationObj: ActiveLocation = {
          id: data.id,
          location_type: data.location_type as 'pickup' | 'delivery',
          displayAddress: addressStr,
        };

        setActiveLocation(locationObj);
        onLocationFetched?.(locationObj);
      } else {
        setActiveLocation(null);
        onLocationFetched?.(null);
      }
    } catch (err) {
      console.error('Unexpected error fetching location:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToLocations = () => {
    router.push('../locations');
  };

  if (loading) {
    return (
      <View style={styles.cardContainer}>
        <ActivityIndicator size="small" color="#6b46c1" style={{ paddingVertical: 10 }} />
      </View>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Ionicons
            name={activeLocation?.location_type === 'pickup' ? 'location' : 'home'}
            size={20}
            color="#6b46c1"
          />
          <Text style={styles.cardTitle}>Fulfillment Address</Text>
        </View>

        <TouchableOpacity onPress={handleNavigateToLocations} activeOpacity={0.7}>
          <Text style={styles.changeBtnText}>
            {activeLocation ? 'Change' : 'Set Location'}
          </Text>
        </TouchableOpacity>
      </View>

      {activeLocation ? (
        <View style={styles.addressBox}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {activeLocation.location_type === 'pickup' ? 'SELF PICKUP' : 'DOOR DELIVERY'}
            </Text>
          </View>
          <Text style={styles.addressText} numberOfLines={2}>
            {activeLocation.displayAddress}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.emptyBox}
          onPress={handleNavigateToLocations}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={22} color="#6b46c1" />
          <Text style={styles.emptyText}>No location set. Tap here to add one.</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  changeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b46c1',
  },
  addressBox: {
    backgroundColor: '#faf9fe',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6b46c1',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 20,
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#faf9fe',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b46c1',
  },
});

