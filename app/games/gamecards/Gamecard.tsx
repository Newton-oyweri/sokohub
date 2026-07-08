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
import { Href } from 'expo-router';

const { width } = Dimensions.get('window');

interface Game {
  id: string;
  title: string;
  image: string;
  route: Href;
}

interface AllgamesProps {
  games: Game[];
  onGamePress: (route: Href) => void;
}

const Allgames = ({ games, onGamePress }: AllgamesProps) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const GameCard = ({ game }: { game: Game }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const hasError = imageErrors[game.id] || false;

    return (
      <TouchableOpacity
        style={styles.gameCard}
        activeOpacity={0.7}
        onPress={() => onGamePress(game.route)}
      >
        <View style={styles.leftContent}>
          {(!imageLoaded || hasError) && (
            <View style={styles.placeholderIcon}>
              <Text style={styles.placeholderText}>{game.title[0]}</Text>
            </View>
          )}

          {!hasError && (
            <Image
              source={{ uri: game.image }}
              style={[
                styles.gameLogo,
                imageLoaded ? styles.imageLoaded : styles.imageHidden
              ]}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageErrors(prev => ({ ...prev, [game.id]: true }))}
            />
          )}
        </View>

        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>{game.title}</Text>
          <Text style={styles.gameSubtitle}>Play Now</Text>
        </View>

        <View style={styles.playButton}>
          <Ionicons name="play-circle" size={22} color="#5C3E35" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.gamesGrid}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gamesGrid: {
    gap: 12,
    width: width - 40,
    paddingBottom: 20,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3EAD3',
    backgroundColor: '#FFF9E6',
    minHeight: 72,
    // Subtle shadow for depth
    shadowColor: '#5C3E35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftContent: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    width: 48,
    height: 48,
  },
  gameLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFDF9',
  },
  imageHidden: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
  },
  imageLoaded: {
    position: 'relative',
    opacity: 1,
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3EAD3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#5C3E35',
    fontSize: 20,
    fontWeight: '800',
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5C3E35',
    marginBottom: 2,
  },
  gameSubtitle: {
    fontSize: 12,
    color: '#8A6E64',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFDF9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3EAD3',
  },
});

export default Allgames;