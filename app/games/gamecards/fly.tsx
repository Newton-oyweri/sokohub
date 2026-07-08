import React, { useState } from 'react';
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

  // Track if the network stream has fully loaded the asset file yet
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.horizontalBar}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.leftContent}>
        {/* 1. Show text IMMEDIATELY by default if image hasn't loaded yet, or if it failed */}
        {(!imageLoaded || imageError) && (
          <Text style={styles.gameTitle}>{ACTIVE_GAME.title}</Text>
        )}

        {/* 2. Load image in background, swap it into view with absolute styling only when ready */}
        {!imageError && (
          <Image
            source={{ uri: ACTIVE_GAME.image }}
            style={[
              styles.gameLogo, 
              imageLoaded ? styles.imageLoadedPosition : styles.imageHiddenHidden
            ]}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
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
    height: '100%', // Enforce boundary container context
  },
  gameLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFDF9',
  },
  // Keeps image from throwing off text layout flows while it loads in the background
  imageHiddenHidden: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  // Places image nicely aligned left inside container once loaded
  imageLoadedPosition: {
    position: 'relative',
    opacity: 1,
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