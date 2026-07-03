import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Alert,
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

// Interface for TypeScript type safety
interface ReviewItem {
  id: string;
  userName: string;
  userAvatar: string;
  cakeName: string;
  rating: number;
  comment: string;
  date: string;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: '1',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    cakeName: 'Red Velvet Supreme',
    rating: 5,
    comment: 'Absolutely spectacular! The cream cheese frosting was perfectly balanced and not too sweet. Will definitely order again for my birthday!',
    date: '2 hours ago'
  },
    {
    id: '2',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    cakeName: 'Red Velvet Supreme',
    rating: 5,
    comment: 'Absolutely spectacular! The cream cheese frosting was perfectly balanced and not too sweet. Will definitely order again for my birthday!',
    date: '2 hours ago'
  }
  ,
    {
    id: '3',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    cakeName: 'Red Velvet Supreme',
    rating: 5,
    comment: 'Absolutely spectacular! The cream cheese frosting was perfectly balanced and not too sweet. Will definitely order again for my birthday!',
    date: '2 hours ago'
  }
  ,
    {
    id: '4',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    cakeName: 'Red Velvet Supreme',
    rating: 5,
    comment: 'Absolutely spectacular! The cream cheese frosting was perfectly balanced and not too sweet. Will definitely order again for my birthday!',
    date: '2 hours ago'
  }
  ,
    {
    id: '5',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    cakeName: 'Red Velvet Supreme',
    rating: 5,
    comment: 'Absolutely spectacular! The cream cheese frosting was perfectly balanced and not too sweet. Will definitely order again for my birthday!',
    date: '2 hours ago'
  }
  ,
    {
    id: '6',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    cakeName: 'Red Velvet Supreme',
    rating: 5,
    comment: 'Absolutely spectacular! The cream cheese frosting was perfectly balanced and not too sweet. Will definitely order again for my birthday!',
    date: '2 hours ago'
  }
  ,
    {
    id: '7',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    cakeName: 'Red Velvet Supreme',
    rating: 5,
    comment: 'Absolutely spectacular! The cream cheese frosting was perfectly balanced and not too sweet. Will definitely order again for my birthday!',
    date: '2 hours ago'
  }
  ,
    {
    id: '8',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    cakeName: 'Red Velvet Supreme',
    rating: 5,
    comment: 'Absolutely spectacular! The cream cheese frosting was perfectly balanced and not too sweet. Will definitely order again for my birthday!',
    date: '2 hours ago'
  }
];

export default function Review() {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);

  // 1. Animated scroll tracker for folding the review form
  const scrollY = useRef(new Animated.Value(0)).current;

  // 2. Animated values for the "WONDERLAND" text loop
  const logoScale = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0.9)).current;

  // Configuration for folding animations
  const HEADER_MAX_HEIGHT = 460; 
  const HEADER_MIN_HEIGHT = 140; // Slightly adjusted to perfectly fit the nested text input comfortably
  const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  // Initialize the Wonderland text animation sequence loop
  useEffect(() => {
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.04,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0.7,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    scaleAnimation.start();
    opacityAnimation.start();

    return () => {
      scaleAnimation.stop();
      opacityAnimation.stop();
    };
  }, []);

  // Form folding Interpolations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const cakeOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const cakeScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const compactFormOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_DISTANCE / 1.5, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const fullFormOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

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
      Alert.alert('Hold on!', 'Please select a star rating before submitting.');
      return;
    }

    const newReview: ReviewItem = {
      id: Date.now().toString(),
      userName: 'You (Anonymous Baker)',
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      cakeName: 'Custom Celebration Cake',
      rating: rating,
      comment: comment.trim() || 'Left a rating!',
      date: 'Just now'
    };

    setReviews([newReview, ...reviews]);
    setRating(0);
    setComment('');
    Alert.alert('Thank you!', 'Your sweet review has been posted.');
  };

  const renderReviewItem = ({ item }: { item: ReviewItem }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={styles.userInfoRow}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
          <View style={styles.cakeRow}>
            <MaterialIcons name="cake" size={14} color="#6b46c1" style={{ marginRight: 4 }} />
            <Text style={styles.cakePurchased}>{item.cakeName}</Text>
          </View>
          <View style={styles.feedStarRow}>{renderStars(item.rating, false, 14)}</View>
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      
      {/* Fixed Sticky Header with Animated Logo Title */}
      <View style={styles.logoHeader}>
        <Animated.Text 
          style={[
            styles.logoText, 
            { transform: [{ scale: logoScale }], opacity: logoOpacity }
          ]}
        >
          WONDERLAND
        </Animated.Text>
      </View>

      <View style={styles.mainContainer}>
        {/* Animated Folding Header (Sticky Submit Area) */}
        <Animated.View style={[styles.animatedHeader, { height: headerHeight }]}>
          
          {/* FULL VIEW FORM: Shows when user is at the top */}
          <Animated.View 
            style={[styles.fullFormWrapper, { opacity: fullFormOpacity }]} 
            pointerEvents={comment.length > 0 || rating > 0 ? 'auto' : 'auto'}
          >
            <Animated.Image
              resizeMode="contain"
              style={[styles.cake, { opacity: cakeOpacity, transform: [{ scale: cakeScale }] }]}
            />
            <Text style={styles.title}>Rate your cake</Text>
            
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
          </Animated.View>

          {/* COMPACT FOLDED VIEW: Renders precise custom elements requested on scroll up */}
          <Animated.View 
            style={[styles.compactFormWrapper, { opacity: compactFormOpacity }]} 
          >
            <View style={styles.compactRow}>
              <View style={styles.compactLeftCol}>
                <Text style={styles.compactTitle}>Your Review</Text>
                {/* Horizontal compact Star mapper underneath title */}
                <View style={styles.compactStarRow}>
                  {renderStars(rating, true, 20)}
                </View>
              </View>
              
              {/* Send Button placed exactly to the right of title */}
              <TouchableOpacity style={styles.compactButton} onPress={handleSubmit}>
                <MaterialIcons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Structured Compact Text Input Box placed directly below */}
            <TextInput
              placeholder="text input here"
              placeholderTextColor="#94a3b8"
              value={comment}
              onChangeText={setComment}
              style={styles.compactInput}
            />
          </Animated.View>

        </Animated.View>

        {/* Scrollable Comments Feed */}
        <Animated.FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReviewItem}
          contentContainerStyle={[
            styles.scrollListContent, 
            { paddingTop: HEADER_MAX_HEIGHT + 15 }
          ]}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <Text style={styles.feedTitle}>Community Reviews ({reviews.length})</Text>
          }
        />
      </View>
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
    position: 'relative',
  },
  logoHeader: {
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    zIndex: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#6b46c1',
    letterSpacing: 5,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    zIndex: 5,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fullFormWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  compactFormWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    flexDirection: 'column',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compactLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactStarRow: {
    flexDirection: 'row',
  },
  compactInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 13,
    color: '#334155',
    width: '100%',
  },
  compactButton: {
    backgroundColor: '#6b46c1',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6b46c1',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  scrollListContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cake: {
    width: '100%',
    height: 110,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
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
  feedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 15,
    marginBottom: 15,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#e2e8f0',
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  reviewDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  cakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cakePurchased: {
    fontSize: 13,
    color: '#6b46c1',
    fontWeight: '600',
  },
  feedStarRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
});