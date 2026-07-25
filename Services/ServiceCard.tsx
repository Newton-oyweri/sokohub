import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceItem } from './api.services';

function formatKES(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

type ServiceCardProps = {
  item: ServiceItem;
  userPhone: string;
  submittingAction: boolean;
  onRequestCallback: () => void;
};

export default function ServiceCard({
  item,
  userPhone,
  submittingAction,
  onRequestCallback,
}: ServiceCardProps) {
  const imageUrl = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null;

  return (
    <View style={styles.card}>
      {imageUrl ? (
        <View style={styles.imageBannerContainer}>
          <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
        </View>
      ) : null}

      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{item.name}</Text>
          </View>

          <View style={styles.rightHeaderWrap}>
            <View style={styles.priceWrap}>
              <Text style={styles.priceLabel}>Starting from</Text>
              <Text style={styles.priceValue}>{formatKES(item.price)}</Text>
            </View>
          </View>
        </View>

        {item.description ? (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ) : null}
      </View>

      {/* Callback Request Section - Always Visible */}
      <View style={styles.callbackContainer}>
        <View style={styles.phoneDisplay}>
          <Ionicons name="call-outline" size={16} color="#6B46C1" />
          <Text style={styles.phoneLabel}>Phone:</Text>
          <Text style={styles.phoneValue}>{userPhone || 'No phone number set'}</Text>
        </View>

        <TouchableOpacity
          style={styles.callbackBtn}
          disabled={submittingAction || !userPhone}
          onPress={onRequestCallback}
        >
          {submittingAction ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="call-outline" size={16} color="#FFFFFF" />
              <Text style={styles.btnText}>Request Callback</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    overflow: 'hidden' 
  },
  imageBannerContainer: { 
    width: '100%', 
    height: 180, 
    backgroundColor: '#F3F4F6' 
  },
  heroImage: { 
    width: '100%', 
    height: '100%' 
  },
  contentContainer: {
    padding: 16,
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  nameContainer: { 
    flex: 1, 
    marginRight: 10 
  },
  name: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1F2937' 
  },
  descriptionContainer: { 
    paddingTop: 6 
  },
  description: { 
    fontSize: 13, 
    color: '#4B5563', 
    lineHeight: 19 
  },
  rightHeaderWrap: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  priceWrap: { 
    alignItems: 'flex-end' 
  },
  priceLabel: { 
    fontSize: 10, 
    color: '#9CA3AF' 
  },
  priceValue: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#6B46C1', 
    marginTop: 1 
  },
  callbackContainer: { 
    padding: 14, 
    backgroundColor: '#FAF5FF', 
    borderTopWidth: 1, 
    borderTopColor: '#F3E8FF' 
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9D8FD',
  },
  phoneLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 6,
    fontWeight: '500',
  },
  phoneValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
    marginLeft: 4,
  },
  callbackBtn: { 
    height: 40, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6, 
    backgroundColor: '#6B46C1',
  },
  btnText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#FFFFFF' 
  },
});
