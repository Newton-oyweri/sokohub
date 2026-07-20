import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function Review() {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const renderStars = (currentRating: number, size: number = 40) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => setRating(star)}
        activeOpacity={0.7}
        style={{ marginHorizontal: 6 }}
      >
        <FontAwesome
          name={star <= currentRating ? "star" : "star-o"}
          size={size}
          color={star <= currentRating ? '#fbbf24' : '#e2e8f0'}
        />
      </TouchableOpacity>
    ));
  };

  const handleSubmit = () => {
    Alert.alert(
      'Hold on!',
      'You will be able to leave a review once you have placed an order.',
      [{ text: 'Okay' }]
    );
  };

  const addTag = (tag: string) => {
    const trimmed = comment.trim();
    setComment(trimmed ? `${trimmed} ${tag}` : tag);
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      {/* Sticky Header */}
      <View style={styles.logoHeader}>
        <Text style={styles.logoText}>WONDEBAKES</Text>
        <Text style={styles.headerSubtitle}>Share your experience</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.mainContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Review Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Rate your treat</Text>

            <View style={styles.starContainer}>
              {renderStars(rating)}
            </View>

            <TextInput
              placeholder="Write a comment (optional)..."
              placeholderTextColor="#94a3b8"
              value={comment}
              onChangeText={setComment}
              style={styles.input}
              multiline
              numberOfLines={5}
              maxLength={500}
            />

            <Text style={styles.charCount}>{comment.length}/500</Text>

            {/* Quick Tags */}
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsLabel}>Quick feedback</Text>
              <View style={styles.tagsRow}>
                {['Fresh', 'Tasty', 'On time', 'Beautiful', 'Value'].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.tag}
                    onPress={() => addTag(tag)}
                  >
                    <Text style={styles.tagText}>+ {tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>

          {/* Placeholder Empty State */}
          <View style={styles.emptyContainer}>
            <MaterialIcons name="rate-review" size={72} color="#e2e8f0" />
            <Text style={styles.emptyTitle}>No reviews yet</Text>
            <Text style={styles.emptySubtitle}>
              Your reviews will appear here after you make a purchase
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  logoHeader: {
    paddingVertical: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#6b46c1',
    letterSpacing: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    minHeight: 110,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 16,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: '#f3e8ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  tagText: {
    color: '#6b46c1',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6b46c1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6b46c1',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 30,
  },
  bottomSpacer: {
    height: 80,
  },
});
