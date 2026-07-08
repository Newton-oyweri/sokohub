import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

export default function Review() {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const renderStars = (currentRating: number, isInteractive: boolean = true, size: number = 32) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity 
        key={star} 
        disabled={!isInteractive} 
        onPress={() => setRating(star)}
        activeOpacity={0.7}
        style={{ marginHorizontal: 4 }}
      >
        <FontAwesome 
          name={star <= currentRating ? "star" : "star-o"} 
          size={size} 
          color={star <= currentRating ? '#fbbf24' : '#cbd5e1'} 
        />
      </TouchableOpacity>
    ));
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Hold on!', 'You will be able to review once you have placed an order.');
      return;
    }
    setRating(0);
    setComment('');
    Alert.alert('Thank you!', 'You are one step away from sharing your experience.');
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      
      {/* Fixed Sticky Header */}
      <View style={styles.logoHeader}>
        <Text style={styles.logoText}>WONDEBAKES</Text>
      </View>

      <ScrollView 
        style={styles.mainContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Review Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Rate your treat</Text>
          
          <View style={styles.starRow}>{renderStars(rating, true, 36)}</View>

          <TextInput
            placeholder="Write a comment (optional)..."
            placeholderTextColor="#94a3b8"
            value={comment}
            onChangeText={setComment}
            style={styles.input}
            multiline
          />

          <View style={styles.tagsRow}>
            <TouchableOpacity style={styles.tag} onPress={() => setComment(prev => prev + " Fresh ")}>
              <Text style={styles.tagText}>Fresh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tag} onPress={() => setComment(prev => prev + " Tasty ")}>
              <Text style={styles.tagText}>Tasty</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tag} onPress={() => setComment(prev => prev + " On time ")}>
              <Text style={styles.tagText}>On time</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>

        {/* No Reviews Section */}
        <View style={styles.emptyContainer}>
          <MaterialIcons name="rate-review" size={60} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptySubtitle}>You haven't shared your experience yet!</Text>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoHeader: {
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6b46c1',
    letterSpacing: 5,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    height: 75,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
    color: '#334155',
  },
  tagsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3e8ff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  tagText: {
    color: '#6b46c1',
    fontSize: 13,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6b46c1',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#6b46c1',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});