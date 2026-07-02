import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type SkyBeatsGameCardProps = {
  onPress: () => void;
  imageError: boolean;
  setImageError: (error: boolean) => void;
};

const SkyBeatsGameCard = ({ onPress, imageError, setImageError }: SkyBeatsGameCardProps) => {
  const ACTIVE_GAME = {
    title: 'SKY BEATS',
    image: 'https://ntfltripxmqpwncfsbzt.supabase.co/storage/v1/object/public/app_general_images/skybeat%20logo.png',
  };

  return (
    <TouchableOpacity
      style={styles.horizontalBar}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.leftContent}>
        {!imageError ? (
          <Image
            source={{ uri: ACTIVE_GAME.image }}
            style={styles.gameLogo}
            resizeMode="cover" // Changed to 'cover' so the image fills the rounded boundaries beautifully
            onError={() => setImageError(true)}
          />
        ) : (
          <Text style={styles.gameTitle}>{ACTIVE_GAME.title}</Text>
        )}
      </View>

      <View style={styles.playButton}>
        <Text style={styles.playButtonText}>PLAY NOW</Text>
        <Ionicons name="play-circle" size={18} color="#FFFDF9" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  horizontalBar: {
    width: width - 40,
    height: 64,
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#F3EAD3',
    
    shadowColor: '#5C3E35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  leftContent: {
    flex: 1,
    justifyContent: 'center',
  },
  gameLogo: {
    width: 44,             // Made it a uniform square so a large radius makes it perfectly round
    height: 44,
    borderRadius: 12,      // Applied here! (Or change to 22 for a perfect circle, 48 works great if the square is 96x96)
    overflow: 'hidden',    // Essential for clipping image edges on iOS & Android
    backgroundColor: '#FFFDF9', // Clean background frame under the logo
  },
  gameTitle: {
    color: '#5C3E35',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5C3E35',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  playButtonText: {
    color: '#FFFDF9',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});

export default SkyBeatsGameCard;