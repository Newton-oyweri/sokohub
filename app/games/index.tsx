import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type Game = {
  id: string;
  title: string;
  route: Href;
  image: string;
  description: string;
  color: string;
  accent: string;
  players: string;
};

export default function GamesHub() {
  const router = useRouter();

  // Match the phone bottom navigation bar to our sweet bakery theme!
  useEffect(() => {
    const setupNavigationBar = async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('#2bff00'); // Warm cream background
        await NavigationBar.setButtonStyleAsync('dark');       // Dark icons
      } catch (e) {
        console.log('NavigationBar setup failed (iOS is fine)');
      }
    };

    setupNavigationBar();
  }, []);

  // Real routes mapped directly to files in your local game directory!
// Real absolute paths mapped to your exact folder names under app/games!
  const games = [
    {
      id: 'snake',
      title: 'Running',
      route: '/games/snake', // Absolute route from the app root
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
      description: 'Chomp the toppings!',
      color: '#FF6B6B', 
      accent: '#E05353',
      players: '12k',
    },
    {
      id: 'memory',
      title: 'Memory Match',
      route: '/games/memory', // Absolute route from the app root
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
      description: 'Match the sweet treats',
      color: '#EC4899', 
      accent: '#DB2777',
      players: '8k',
    },
    {
      id: 'pizzamaker',
      title: 'Pizza Maker',
      route: '/games/pizzamaker', // Matches your folder 'pizzamaker' perfectly!
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80',
      description: 'Bake the ultimate pie!',
      color: '#F59E0B', 
      accent: '#D97706',
      players: '15k',
    },
    {
      id: 'chef',
      title: 'Catch Cakes',
      route: '/games/chef', // Matches your folder 'pizzamaker' perfectly!
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=60',
      description: 'Bake the ultimate pie!',
      color: '#F59E0B', 
      accent: '#D97706',
      players: '15k',
    },
     {
      id: 'test',
      title: 'Catch Cakes',
      route: '/games/test', // Matches your folder 'pizzamaker' perfectly!
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=60',
      description: 'Bake the ultimate pie!',
      color: '#F59E0B', 
      accent: '#D97706',
      players: '15k',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9E6" />

      {/* Wonderbakes Fun Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#5C3E35" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wonderbakes Arcade 🍕</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>
          Play Games • Score Big • Win Sweet Rewards! 🏆🍰
        </Text>

        {/* Search for Treats */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#A79288" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search for your favorite game...</Text>
        </View>

        {/* Games Grid */}
        <View style={styles.grid}>
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              activeOpacity={0.85}
              // Navigates directly to your real game route!
              onPress={() => router.push(game.route)}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: game.image }} 
                  style={styles.gameImage}
                  resizeMode="cover"
                />
                <View style={[styles.gradientOverlay, { backgroundColor: game.accent + '33' }]} />
                
                <View style={[styles.playButton, { backgroundColor: game.color }]}>
                  <Ionicons name="play" size={28} color="#ffffff" />
                </View>
              </View>

              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle} numberOfLines={1}>{game.title}</Text>
                <Text style={styles.gameDescription} numberOfLines={1}>{game.description}</Text>
                
                <View style={styles.stats}>
                  <Ionicons name="flame" size={14} color="#FF6B6B" />
                  <Text style={styles.players}>{game.players} baking today</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Coming Soon Kitchen */}
        <View style={styles.moreSection}>
          <Text style={styles.moreTitle}>Baking Fresh Games Soon! 🕒</Text>
          <Text style={styles.moreSubtitle}>
            Our chefs are creating brand new game modes every week!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9', // Clean warm white pastry paper background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#FFF9E6', // Sweet dough vanilla tone
    borderBottomWidth: 2,
    borderBottomColor: '#F3EAD3',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#5C3E35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5C3E35', // Warm chocolate brown text
  },
  content: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 90,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A6E64',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5ECE1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  searchIcon: { marginRight: 10 },
  searchPlaceholder: {
    color: '#A79288',
    fontSize: 15,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gameCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#5C3E35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3EAD3',
  },
  imageContainer: {
    height: CARD_WIDTH * 0.95,
    position: 'relative',
  },
  gameImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  playButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  gameInfo: {
    padding: 14,
  },
  gameTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#5C3E35',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    color: '#8A6E64',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  players: {
    fontSize: 12,
    color: '#A79288',
    fontWeight: '600',
    marginLeft: 4,
  },
  moreSection: {
    marginTop: 10,
    padding: 24,
    backgroundColor: '#FFF9E6',
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E6D3A7',
  },
  moreTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#5C3E35',
    marginBottom: 6,
  },
  moreSubtitle: {
    fontSize: 13.5,
    color: '#8A6E64',
    textAlign: 'center',
    lineHeight: 18,
  },
});