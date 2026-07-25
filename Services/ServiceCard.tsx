import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ServiceItem } from './services.api';

function formatKES(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

type ServiceCardProps = {
  item: ServiceItem;
  isExpanded: boolean;
  userPhone: string;
  notes: string;
  submittingAction: boolean;
  onToggleExpand: () => void;
  onPhoneChange: (text: string) => void;
  onNotesChange: (text: string) => void;
  onRequestCallback: () => void;
};

export default function ServiceCard({
  item,
  isExpanded,
  userPhone,
  notes,
  submittingAction,
  onToggleExpand,
  onPhoneChange,
  onNotesChange,
  onRequestCallback,
}: ServiceCardProps) {
  const imageUrl = item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null;

  return (
    <View style={styles.card}>
      {/* Clickable Header & Image Zone */}
      <TouchableOpacity activeOpacity={0.8} onPress={onToggleExpand}>
        {imageUrl ? (
          <View style={styles.imageBannerContainer}>
            <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
          </View>
        ) : null}

        <View style={styles.row}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{item.name}</Text>
          </View>

          <View style={styles.rightHeaderWrap}>
            <View style={styles.priceWrap}>
              <Text style={styles.priceLabel}>Starting from</Text>
              <Text style={styles.priceValue}>{formatKES(item.price)}</Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#6B7280"
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>

        {item.description ? (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description} numberOfLines={isExpanded ? undefined : 2}>
              {item.description}
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>

      {/* Expanded Form Section */}
      {isExpanded && (
        <View style={styles.expandedContainer}>
          <TextInput
            style={styles.formInput}
            placeholder="Phone number for callback..."
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={userPhone}
            onChangeText={onPhoneChange}
          />

          <TextInput
            style={[styles.formInput, styles.textArea]}
            placeholder="Add specific details or instructions..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={2}
            value={notes}
            onChangeText={onNotesChange}
          />

          <TouchableOpacity
            style={styles.callbackBtn}
            disabled={submittingAction}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  imageBannerContainer: { width: '100%', height: 180, backgroundColor: '#F3F4F6' },
  heroImage: { width: '100%', height: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, paddingHorizontal: 16 },
  nameContainer: { flex: 1, marginRight: 10 },
  name: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  descriptionContainer: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14 },
  description: { fontSize: 13, color: '#4B5563', lineHeight: 19 },
  rightHeaderWrap: { flexDirection: 'row', alignItems: 'center' },
  priceWrap: { alignItems: 'flex-end' },
  priceLabel: { fontSize: 10, color: '#9CA3AF' },
  priceValue: { fontSize: 15, fontWeight: '700', color: '#6B46C1', marginTop: 1 },
  expandedContainer: { padding: 14, backgroundColor: '#FAF5FF', borderTopWidth: 1, borderTopColor: '#F3E8FF' },
  formInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E9D8FD', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: '#1F2937', marginBottom: 8 },
  textArea: { height: 52, textAlignVertical: 'top' },
  callbackBtn: { height: 40, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#6B46C1', marginTop: 4 },
  btnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});

